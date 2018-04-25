/* !!! GENERATED: DO NOT MODIFY !!! */
import { FilterQuery, FindOneOptions, ObjectId } from 'mongodb';
import { DataDocument, DataModelAbstractMethods } from './method.type';
import { STATUS_CODE } from '@gongt/silly-b/dist/protocol/protocol';
import { RequestError } from '@gongt/silly-b/dist/protocol/request-error';
import { debugPromise, debugStart } from './debug';
import { BaseDocument } from './base.type';
import { ModelFindByIdAndUpdateOptions, ModelFindOneAndUpdateOptions, ModelUpdateOptions, QueryCursor, DocumentQuery } from 'mongoose';
import { MongoUpdate } from './mongodb.type';

export abstract class MongodbOperationImplements<IDocType extends BaseDocument> extends DataModelAbstractMethods<IDocType> {
	protected find<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): Promise<DataDocument<Pick<IDocType, T>>[]>
	protected find<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType>[]>
	protected find(query: FilterQuery<IDocType>): Promise<DataDocument<IDocType>[]>

	protected find<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType|Pick<IDocType, T>>[]|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::find`, this.log.silly, ...arguments);
		}
		const p = this.model.find(query, projection, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::find`, this.log.data, this.log.error, p);
		}
		return p;
	}

	public getOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): Promise<DataDocument<Pick<IDocType, T>>>
	public getOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType>>
	public getOne(query: FilterQuery<IDocType>): Promise<DataDocument<IDocType>>

	public getOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType|Pick<IDocType, T>>> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::getOne(findOne)`, this.log.silly, ...arguments);
		}
		const p = this.model.findOne(query, projection, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::getOne(findOne)`, this.log.data, this.log.error, p);
		}
		return p.then((data) => {
			if (!data) {
				this.log.debug('data not found: %j', query);
				throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, `在数据库 "${this.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`);
			}
			return data;
		});
	}

	public findOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): Promise<DataDocument<Pick<IDocType, T>>|null>
	public findOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType>|null>
	public findOne(query: FilterQuery<IDocType>): Promise<DataDocument<IDocType>|null>

	public findOne<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType|Pick<IDocType, T>>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::findOne`, this.log.silly, ...arguments);
		}
		const p = this.model.findOne(query, projection, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::findOne`, this.log.data, this.log.error, p);
		}
		return p;
	}

	public findById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): Promise<DataDocument<Pick<IDocType, T>>|null>
	public findById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType>|null>
	public findById(query: ObjectId|string): Promise<DataDocument<IDocType>|null>

	public findById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType|Pick<IDocType, T>>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::findById`, this.log.silly, ...arguments);
		}
		const p = this.model.findById(query, projection, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::findById`, this.log.data, this.log.error, p);
		}
		return p;
	}

	public getById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): Promise<DataDocument<Pick<IDocType, T>>>
	public getById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType>>
	public getById(query: ObjectId|string): Promise<DataDocument<IDocType>>

	public getById<T extends keyof IDocType>(
		query: ObjectId|string,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): Promise<DataDocument<IDocType|Pick<IDocType, T>>> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::getById(findById)`, this.log.silly, ...arguments);
		}
		const p = this.model.findById(query, projection, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::getById(findById)`, this.log.data, this.log.error, p);
		}
		return p.then((data) => {
			if (!data) {
				this.log.debug('data not found: %j', query);
				throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, `在数据库 "${this.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`);
			}
			return data;
		});
	}

	protected _queryRaw<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): DocumentQuery<(Pick<IDocType, T>)[], DataDocument<Pick<IDocType, T>>>
	protected _queryRaw<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): DocumentQuery<(IDocType)[], DataDocument<IDocType>>
	protected _queryRaw(query: FilterQuery<IDocType>): DocumentQuery<(IDocType)[], DataDocument<IDocType>>

	protected _queryRaw<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): DocumentQuery<(IDocType|Pick<IDocType, T>|null)[], DataDocument<IDocType|Pick<IDocType, T>|null>> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::_queryRaw(find)`, this.log.silly, ...arguments);
		}
		const p = this.model.find(query, projection, options);
		return p;
	}

	public findCursor<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, true>,
		options?: FindOneOptions,
	): QueryCursor<DataDocument<Pick<IDocType, T>>>
	public findCursor<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: Record<T, false>,
		options?: FindOneOptions,
	): QueryCursor<DataDocument<IDocType>>
	public findCursor(query: FilterQuery<IDocType>): QueryCursor<DataDocument<IDocType>>

	public findCursor<T extends keyof IDocType>(
		query: FilterQuery<IDocType>,
		projection?: T[]|Record<T, boolean>,
		options?: FindOneOptions,
	): QueryCursor<DataDocument<IDocType|Pick<IDocType, T>>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::findCursor(find)`, this.log.silly, ...arguments);
		}
		const p = this.model.find(query, projection, options).cursor();
		return p;
	}

	protected findByIdAndUpdate(
		query: ObjectId|string,
		update: MongoUpdate<IDocType>,
		options?: ModelFindByIdAndUpdateOptions,
	): Promise<DataDocument<IDocType>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::findByIdAndUpdate`, this.log.silly, ...arguments);
		}
		const p = this.model.findByIdAndUpdate(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::findByIdAndUpdate`, this.log.data, this.log.error, p);
		}
		return p;
	}

	protected findOneAndUpdate(
		query: FilterQuery<IDocType>,
		update: MongoUpdate<IDocType>,
		options?: ModelFindOneAndUpdateOptions,
	): Promise<DataDocument<IDocType>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::findOneAndUpdate`, this.log.silly, ...arguments);
		}
		const p = this.model.findOneAndUpdate(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::findOneAndUpdate`, this.log.data, this.log.error, p);
		}
		return p;
	}

	protected getByIdAndUpdate(
		query: ObjectId|string,
		update: MongoUpdate<IDocType>,
		options?: ModelFindByIdAndUpdateOptions,
	): Promise<DataDocument<IDocType>> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::getByIdAndUpdate{findByIdAndUpdate}`, this.log.silly, ...arguments);
		}
		const p = this.model.findByIdAndUpdate(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::getByIdAndUpdate{findByIdAndUpdate}`, this.log.data, this.log.error, p);
		}
		return p.then((data) => {
			if (!data) {
				this.log.debug('data not found: %j', query);
				throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, `在数据库 "${this.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`);
			}
			return data;
		});
	}

	protected getOneAndUpdate(
		query: FilterQuery<IDocType>,
		update: MongoUpdate<IDocType>,
		options?: ModelFindOneAndUpdateOptions,
	): Promise<DataDocument<IDocType>> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::getOneAndUpdate{findOneAndUpdate}`, this.log.silly, ...arguments);
		}
		const p = this.model.findOneAndUpdate(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::getOneAndUpdate{findOneAndUpdate}`, this.log.data, this.log.error, p);
		}
		return p.then((data) => {
			if (!data) {
				this.log.debug('data not found: %j', query);
				throw new RequestError(STATUS_CODE.DATA_NOT_EXISTS, `在数据库 "${this.name}" 中进行查询 ${JSON.stringify(query)}，没有找到数据`);
			}
			return data;
		});
	}

	protected update(
		query: FilterQuery<IDocType>,
		update: MongoUpdate<IDocType>,
		options?: ModelUpdateOptions,
	): Promise<DataDocument<IDocType>|null> {
		if (this.log.data.enabled) {
			debugStart(`${this.name}::update`, this.log.silly, ...arguments);
		}
		const p = this.model.update(query, update, options).exec();
		if (this.log.data.enabled) {
			debugPromise(`${this.name}::update`, this.log.data, this.log.error, p);
		}
		return p;
	}
}
