import { createClient, RedisClient } from 'redis';
import { createLogger } from '@gongt/silly-b/dist/debug/create-logger';
import { LOG_LEVEL } from '@gongt/silly-b/dist/debug/levels';
import { sillyConfig } from '../config/storage';
import { pushInitList } from '@gongt/silly-b/dist/async/boot';

const error = createLogger(LOG_LEVEL.ERROR, 'redis');
export let redisUrl: string;

export function connectToRedis(redisUrl: string = sillyConfig.require('RedisLockServer')): RedisClient {
	const client = createClient(redisUrl, {
		retry_strategy(options) {
			setTimeout(() => {
				process.exit(1);
			}, 1000);
			console.error(options.error);
			error('redis client connect error:', options.error);
			if (options.error) {
				return new Error('redis connect fail: ' + options.error.code);
			}
			return new Error('redis disconnect - unknown reason.');
		},
	});
	client.on('error', function (err) {
		error('redis client issue error:', err);
		console.error(err);
	});
	
	pushInitList('redis:' + redisUrl, new Promise((resolve, reject) => {
		client.on('error', reject);
		client.on('connect', () => resolve());
	}));
	
	return client;
}
