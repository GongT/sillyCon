import { TypedConfig } from '@gongt/silly-b/dist/config/type-config';

/** @internal */
export const mongodbServerRegistry = new TypedConfig<{[id: string]: string}>('mongodb');

export function registerMongodbServer(name: string, url: string) {
	mongodbServerRegistry.overwrite(name, url);
}

export function getMongodbUrl(nameOrUrl: string) {
	if (mongodbServerRegistry.has(nameOrUrl)) {
		return mongodbServerRegistry.require(nameOrUrl);
	} else if (nameOrUrl.startsWith('mongodb://')) {
		return nameOrUrl;
	} else {
		return null;
	}
}
