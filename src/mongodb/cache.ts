import { createLogger } from '@gongt/silly-b/dist/debug/create-logger';
import { LOG_LEVEL } from '@gongt/silly-b/dist/debug/levels';
import { dateToChineseFormat } from '@gongt/silly-b/dist/datetime/dump-date';
import { sillyConfig } from '../config/storage';

const debug = createLogger(LOG_LEVEL.SILLY, 'cache');
const warn = createLogger(LOG_LEVEL.WARN, 'cache');
const data = createLogger(LOG_LEVEL.DATA, 'cache');

export class ICacheClass {
	del: RemoveFunction;
	get: GetterFunction;
	set: SetterFunction;
}

export class ICacheClassPromise {
	clear: GetterPromise;
	del: RemovePromise;
	get: GetterPromise;
	ignoreError: (e: Error) => void;
	set: SetterPromise;
}

export type NodejsCallback = (err: Error, data: any) => void;

export type SetterFunction = (name: string, value: Object, ttl: number, cb?: NodejsCallback) => void;
export type RemoveFunction = (name: string, cb?: NodejsCallback) => void;
export type GetterFunction = (name: string, cb: NodejsCallback) => void;

export type CacheKeyType = (string|number)[];
export type SetterPromise = (name: CacheKeyType, value: any, ttl: number) => Promise<any>;
export type RemovePromise = (name: CacheKeyType) => Promise<void>;
export type GetterPromise = (name: CacheKeyType) => Promise<any>;

export function wrapCache(cache: ICacheClass, cache2: ICacheClass = cache): ICacheClassPromise {
	const debugMode = sillyConfig.require('IsDebugMode');
	
	async function id(ks: CacheKeyType, refresh = false) {
		let k0: number;
		if (typeof ks[0] === 'number') {
			k0 = ks.shift() as number;
			if (k0 === 0) {
				return ks.join(':');
			}
		} else {
			k0 = 1;
		}
		const kl = ks.slice(0, k0).join(':');
		const kr = ks.slice(k0).join(':');
		const k1 = 'cache-name:' + kl;
		debug('    k1 is "%s"', k1);
		if (debugMode) {
			if (!kr) {
				warn('key not have changing part: k0=%s; key=[%s]', k0, ks.join(', '));
			}
		}
		
		let id = refresh? '' : await new Promise((resolve, reject) => {
			const wrappedCallback = (err: Error, data: string) => err? reject(err) : resolve(data);
			cache2.get(k1, wrappedCallback);
		});
		
		if (!id) {
			id = (Math.random() * 1000000).toFixed(0);
			await new Promise((resolve, reject) => {
				const wrappedCallback = (err: Error, data: string) => err? reject(err) : resolve(data);
				cache2.set(k1, id, 3600, wrappedCallback);
			});
			debug('    new id created "%s"', id);
		}
		
		return `${id}.${k0}_${kl}!${kr}`;
	}
	
	function wrapError(cb: (err?: Error, data?: string) => any) {
		return (err: Error, data: string) => {
			if (err) {
				warn('cache failed: ', err);
			}
			return cb(err, data);
		};
	}
	
	return {
		async get(ks: CacheKeyType) {
			const k = await id(ks);
			const data = await new Promise<void>((resolve, reject) => {
				const wrappedCallback = (err: Error, data: any) => {
					return err? reject(err) : resolve(data);
				};
				cache.get(k, wrapError(wrappedCallback));
			});
			if (debugMode) {
				const debug_date: any = await new Promise<void>((resolve, reject) => {
					const wrappedCallback = (err: Error, data: any) => {
						return err? reject(err) : resolve(data);
					};
					cache.get(k + '.debug-cache-expire', wrapError(wrappedCallback));
				});
				
				debug('get %s - ', k, `${data
					? 'HIT (' + dateToChineseFormat(new Date(parseInt(debug_date))) + ')'
					: 'MISS'
					}`);
			}
			return data;
		},
		async set(ks: CacheKeyType, value: any, ttl: number) {
			if (typeof ttl !== 'number' || ttl < 0) {
				throw new Error(`cache set: ttl must be a number. got: ${ttl}(${typeof ttl})`);
			}
			if (ttl === 0) {
				return value;
			}
			if (ttl > 300) {
				ttl = 300; // prevent cache miss Sync
			}
			
			const k = await id(ks);
			debug('set %s, ttl=%s: ', k, ttl);
			data('%j', value);
			
			if (debugMode) {
				const d = new Date();
				d.setSeconds(d.getSeconds() + ttl);
				const wrappedCallback = (err: Error, data: string) => {
					return err? warn(err) : undefined;
				};
				cache.set(k + '.debug-cache-expire', d.getTime().toFixed(0), 1000000, wrappedCallback);
			}
			
			return await new Promise<void>((resolve, reject) => {
				const wrappedCallback = (err: Error) => err? reject(err) : resolve(value);
				cache.set(k, value, ttl, wrapError(wrappedCallback));
			});
		},
		async del(ks: CacheKeyType) {
			const k = await id(ks);
			debug('del %s', k);
			return await new Promise<void>((resolve, reject) => {
				const wrappedCallback = (err: Error) => err? reject(err) : resolve();
				cache.del(k, wrapError(wrappedCallback));
			});
		},
		clear(ks: string[]) {
			const ks_cp: CacheKeyType = ks.slice();
			ks_cp.unshift(ks.length);
			debug('clear %s', ks_cp);
			return id(ks_cp, true);
		},
		ignoreError(e: Error) {
			warn('cache operation failed: ', e.message);
		},
	};
}
