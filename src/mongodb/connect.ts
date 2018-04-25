import { Connection, createConnection, Model, Schema, } from 'mongoose';
import { createLogger } from '@gongt/silly-b/dist/debug/create-logger';
import { LOG_LEVEL } from '@gongt/silly-b/dist/debug/levels';
import { isAppReady, pushInitList } from '@gongt/silly-b/dist/async/boot';
import { PromiseCounter } from '@gongt/silly-b/dist/async/promise-counter';
import { CallbackList } from '@gongt/silly-b/dist/function/callback-list';
import { assertFunctionName } from '@gongt/silly-b/dist/function/debuggable';
import { DelayCallbackList } from '@gongt/silly-b/dist/function/delay-callback-list';
import { graceFullExit } from '@gongt/silly-node/dist/boot/gracefull';

const info = createLogger(LOG_LEVEL.INFO, 'db');
const error = createLogger(LOG_LEVEL.ERROR, 'db');

/** @internal */
export let testDatabaseMuted = false;

export function muteDatabaseConnectionForTest() {
	info('muteDatabaseConnectionForTest()');
	testDatabaseMuted = true;
}

/** @internal */
export function getConnection(name: string, uri: string): DelayCallbackList<Connection> {
	const connectPromise = ensureRegistry(name, uri);
	if (connectPromise && !isAppReady()) {
		pushInitList('mongodb connection: ' + name, connectPromise);
	}
	return connectRegistry[name];
}

const connectRegistry: {[name: string]: DelayCallbackList<Connection>} = {};

function ensureRegistry(name: string, uri: string) {
	if (!connectRegistry[name]) {
		const list = new DelayCallbackList<Connection>();
		connectRegistry[name] = list;
		return connect(name, uri).then((connection) => {
			list.run(connection);
			// after all init, connection will resolve
		}, () => {
			graceFullExit(1);
		});
	}
}

function connect(name: string, uri: string) {
	info('connecting to database: %s: %s', name, uri);
	
	const database: Connection = createConnection(uri, {
		reconnectTries: 0,
		autoReconnect: false,
		promiseLibrary: Promise,
	});
	
	database.on('error', () => {
		error('connection error (to %s [%s])', name, uri);
	});
	database.on('disconnected', () => {
		error(`!!! ${name} disconnected !!!`);
		throw new Error(`database connection to [${name}](${uri}) has dropped.`);
	});
	
	const p = new Promise<Connection>((resolve, reject) => {
		database.on('error', reject);
		database.on('open', () => resolve(database));
	});
	waitDatabase.add(p);
	return p;
}

const waitDatabase = new PromiseCounter();

export function waitDatabaseConnection() {
	return waitDatabase.wait();
}

const modelMapper = new WeakMap<Connection, {[collection: string]: Model<any>}>();

/** @internal */
export function findExistsModel(connection: Connection, collection: string) {
	if (!modelMapper.has(connection)) {
		return;
	}
	return modelMapper.get(connection)[collection];
}

/** @internal */
export function registerExistsModel(connection: Connection, collection: string, model: Model<any>) {
	if (!modelMapper.has(connection)) {
		modelMapper.set(connection, {});
	}
	modelMapper.get(connection)[collection] = model;
}

/** @internal */
export const globalSchemaHook = new CallbackList<Schema>();

export function addGlobalSchemaHookFunction(hookFunction: (schema: Schema) => void) {
	assertFunctionName(hookFunction);
	globalSchemaHook.add(hookFunction);
}
