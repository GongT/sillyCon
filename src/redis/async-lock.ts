import * as Redlock from 'redlock';
import { createLogger } from '@gongt/silly-b/dist/debug/create-logger';
import { LOG_LEVEL } from '@gongt/silly-b/dist/debug/levels';
import { connectToRedis } from './connect';
import { sillyConfig } from '../config/storage';

const error = createLogger(LOG_LEVEL.ERROR, 'redlock');
const debug = createLogger(LOG_LEVEL.DEBUG, 'redlock');
const warn = createLogger(LOG_LEVEL.WARN, 'redlock');

export type UnlockFunction = () => Promise<void>

let server: Redlock;

function connect(redisUrl: string = sillyConfig.require('RedisCacheServer')) {
	if (!server) {
		server = new Redlock([connectToRedis(redisUrl)], {
			retryCount: 3,
			retryDelay: 1000,
		});
		server.on('clientError', function (err) {
			error('A redis error has occurred:', err);
		});
	}
}

export class AsyncLocker {
	MAX_HOLD = 30000;
	TIMEOUT = 5000;
	protected holdList: {[id: string]: NodeJS.Timer};
	private lockCount: number;
	protected lockTimer: NodeJS.Timer;
	protected lockerList: {[id: string]: Redlock.Lock};
	
	constructor(private resource: string) {
		connect();
		
		this.lockCount = 0;
		this.lockerList = {};
		this.holdList = {};
	}
	
	async lock(name: string = 'root') {
		debug('get lock for %s:%s', this.resource, name);
		const lock = await server.lock(this.resource + ':' + name, this.TIMEOUT);
		
		this.lockerList[name] = lock;
		this.preventTooLong(lock);
		
		this.increaseRenew();
		
		return this.unlock.bind(this, name);
	}
	
	async unlock(name: string = 'root') {
		const lock = this.lockerList[name];
		delete this.lockerList[name];
		
		if (!lock) {
			warn('duplicate release lock for %s:%s', this.resource, name);
			return;
		}
		
		await lock.unlock();
		
		debug('release lock for %s:%s', this.resource, name);
		this.decreaseRenew();
		this.notTooLong(lock);
	}
	
	protected decreaseRenew() {
		this.lockCount--;
		if (this.lockCount === 0) {
			clearInterval(this.lockTimer);
			this.lockTimer = null;
		}
	}
	
	protected increaseRenew() {
		if (this.lockCount === 0) {
			this.lockTimer = setInterval(() => {
				for (const lock of Object.values(this.lockerList)) {
					debug('extend lock for %s', lock.resource);
					lock.extend(this.TIMEOUT).catch((e) => {
						error('extend lock failed: ' + lock.resource);
					});
				}
			}, Math.round(this.TIMEOUT / 2));
		}
		this.lockCount++;
	}
	
	private notTooLong(lock: Redlock.Lock) {
		if (this.holdList.hasOwnProperty(lock.resource)) {
			clearTimeout(this.holdList[lock.resource]);
			delete this.holdList[lock.resource];
		}
	}
	
	private preventTooLong(lock: Redlock.Lock) {
		this.holdList[lock.resource] = setTimeout(() => {
			delete this.holdList[lock.resource];
			error('lock hold too long, force release: %s', lock.resource);
			lock.unlock().then(() => {
				error('force released lock: %s', lock.resource);
			}, (e) => {
				error('force release lock %s failed: %s', lock.resource, e.message);
			});
		}, this.MAX_HOLD);
	}
}
