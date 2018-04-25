const fs = require('fs');
const path = require('path');

function createImplementsUpdate(name, original, query, assert, options, findResult = `DataDocument<IDocType>`) {
	const debugName = '`${this.name}::' + name + (name === original? '' : `{${original}}`) + '`';
	// language=TEXT
	let func = `
	protected ${name}(
		query: ${query},
		update: MongoUpdate<IDocType>,
		options?: ${options},
	): Promise<${findResult}${assert? '' : '|null'}> {
		if (this.log.data.enabled) {
			debugStart(${debugName}, this.log.silly, ...arguments);
		}
		const p = this.model.${original}(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(${debugName}, this.log.data, this.log.error, p);
		}
		`;
	
	func = createAssert(assert, func);
	
	return func + '\n\t}\n';
}

function wrap(wrapper, inner) {
	if (!wrapper) {
		return inner;
	}
	if (/{}/.test(wrapper)) {
		return wrapper.replace(/{}/g, inner);
	} else {
		return `${wrapper}<${inner}>`;
	}
}

function returnType(array, assert, wrap1, wrap2, pick = null) {
	let base;
	if (pick === true) {
		base = 'Pick<IDocType, T>';
	} else if (pick === false) {
		base = 'IDocType';
	} else {
		base = 'IDocType|Pick<IDocType, T>';
	}
	const TRes = wrap(wrap2, base);
	const result = TRes + `${array}${assert? '' : '|null'}`;
	
	return wrap(wrap1, result);
}

function createDeclareFind(visibility, name, original, query, array, assert, wrap1, wrap2) {
	if (Arr === array || wrap1 !== rPromise) {
		assert = true;
	}
	// language=TEXT
	return `
	${visibility} ${name}<T extends keyof IDocType>(
		query: ${query},
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): ${returnType(array, assert, wrap1, wrap2, true)}
	${visibility} ${name}<T extends keyof IDocType>(
		query: ${query},
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): ${returnType(array, assert, wrap1, wrap2, false)}
	${visibility} ${name}(query: ${query}): ${returnType(array, assert, wrap1, wrap2, false)}
`;
}

function createImplementsFind(visibility, name, original, query, array, assert, wrap1, wrap2, verb = 'exec') {
	const debugName = '`${this.name}::' + name + (name === original? '' : `(${original})`) + '`';
	// language=TEXT
	let func = `
	${visibility} ${name}<T extends keyof IDocType>(
		query: ${query},
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): ${returnType(array, assert, wrap1, wrap2)} {
		if (this.log.data.enabled) {
			debugStart(${debugName}, this.log.silly, ...arguments);
		}
		const p = this.model.${original}(query, projection, options)${verb? `.${verb}()` : ''};
		`;
	
	if (wrap1 === rPromise) {
		func += `if (this.log.data.enabled) {
			debugPromise(${debugName}, this.log.data, this.log.error, p);
		}
		`;
	}
	
	if (Arr !== array || wrap1 !== rPromise) {
		func = createAssert(assert, func);
	} else {
		func += 'return p;';
	}
	
	return func + '\n\t}\n';
}

function createAssert(assert, func) {
	if (assert) {
		func += `return p.then((data) => {
			if (!data) {
				this.log.debug('data not found: %j', query);
				throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, ${quote('`在数据库 "${this.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`')});
			}
			return data;
		});`;
	} else {
		func += `return p;`;
	}
	return func;
}

const condition = `FilterQuery<IDocType>`;
const byid = `ObjectId|string`;
const Arr = '[]', Obj = '';
const Nullable = false, Throw = true;
const rPromise = 'Promise', noWrap = '';

// language=TEXT
let interfaceDefine = `export interface MongodbOperationInterface<IDocType> {`;
// language=TEXT
let implementsDefine = `export abstract class MongodbOperationImplements<IDocType extends BaseDocument> extends DataModelAbstractMethods<IDocType> {`;

[
	[['protected', 'find', 'find', condition, Arr, Nullable, rPromise, 'DataDocument'], [], ['exec']],
	[['public', 'getOne', 'findOne', condition, Obj, Throw, rPromise, 'DataDocument'], [], ['exec']],
	[['public', 'findOne', 'findOne', condition, Obj, Nullable, rPromise, 'DataDocument'], [], ['exec']],
	[['public', 'findById', 'findById', byid, Obj, Nullable, rPromise, 'DataDocument'], [], ['exec']],
	[['public', 'getById', 'findById', byid, Obj, Throw, rPromise, 'DataDocument'], [], ['exec']],
	[['protected', '_queryRaw', 'find', condition, Obj, Nullable, 'DocumentQuery<({})[], DataDocument<{}>>', noWrap], [], ['']],
	[['public', 'findCursor', 'find', condition, Obj, Nullable, 'QueryCursor', 'DataDocument'], [], ['cursor']],
].forEach(([args, declareArgs, implArgs]) => {
	implementsDefine += createDeclareFind(...args, ...declareArgs);
	implementsDefine += createImplementsFind(...args, ...implArgs);
});

[
	['findByIdAndUpdate', 'findByIdAndUpdate', byid, Nullable, 'ModelFindByIdAndUpdateOptions'],
	['findOneAndUpdate', 'findOneAndUpdate', condition, Nullable, 'ModelFindOneAndUpdateOptions'],
	['getByIdAndUpdate', 'findByIdAndUpdate', byid, Throw, 'ModelFindByIdAndUpdateOptions'],
	['getOneAndUpdate', 'findOneAndUpdate', condition, Throw, 'ModelFindOneAndUpdateOptions'],
	['update', 'update', condition, Nullable, 'ModelUpdateOptions'],
].forEach((args) => {
	implementsDefine += createImplementsUpdate(...args);
});

interfaceDefine += '}';
implementsDefine += '}';

fs.writeFileSync(path.resolve(__dirname, 'src/mongodb/mongodb.interface.ts'), `/* !!! GENERATED: DO NOT MODIFY !!! */
import { FilterQuery, FindOneOptions, ObjectId } from 'mongodb';
import { DataDocument, DataModelAbstractMethods } from './method.type';
import { STATUS_CODE } from '@gongt/silly-b/dist/protocol/protocol';
import { RequestError } from '@gongt/silly-b/dist/protocol/request-error';
import { debugPromise, debugStart } from './debug';
import { BaseDocument } from './base.type';
import { ModelFindByIdAndUpdateOptions, ModelFindOneAndUpdateOptions, ModelUpdateOptions, QueryCursor, DocumentQuery } from 'mongoose';
import { MongoUpdate } from './mongodb.type';

${implementsDefine}
`);

function quote(str) {
	return str;
}
