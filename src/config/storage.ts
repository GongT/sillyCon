import { TypedConfig } from '@gongt/silly-b/dist/config/type-config';
import { waitAppStart } from '@gongt/silly-b/dist/async/boot';
import { setDefaults, WellKnownConfig } from '@gongt/silly-b/dist/config/well-known';

export interface ConnectionConfig extends WellKnownConfig {
	RedisCacheServer: string;
	RedisLockServer: string;
	MongodbServer: string;
}

export const sillyConfig = new TypedConfig<ConnectionConfig>();

setDefaults(sillyConfig);

waitAppStart().then(() => {
	sillyConfig.freeze();
});
