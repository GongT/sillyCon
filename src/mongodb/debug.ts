import { inspect } from 'util';
import { DataModel } from './mongodb';
import { IDebugger } from '@gongt/silly-b/dist/debug/create-logger';
import { RequestError } from '@gongt/silly-b/dist/protocol/request-error';
import { STATUS_CODE } from '@gongt/silly-b/dist/protocol/protocol';

/** @internal */
export function debugStart(name: string, sill: IDebugger, ...args: any[]) {
	sill('{db-debug} .%s(%s)',
		name,
		args.map(e => inspect(e, false, 3, true)).join(', '),
	);
}

/** @internal */
export function debugPromise(name: string, log: IDebugger, error: IDebugger, p: Promise<any>) {
	p.then((data) => {
		log('\x1B[2m{db-debug} .%s -> success: %j\x1B[0m', name, data);
	}, (e) => {
		error('{db-debug} .%s -> failed: %s', name, e.message);
	});
}

export function assertDataExists<T>(query: any, model: DataModel<any>, data: T): T {
	model.log.debug('data not found: ' + JSON.stringify(query));
	throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, `在数据库 "${model.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`);
}
