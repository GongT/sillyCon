/// <reference types="node" />
import { ObjectId } from 'mongodb';
import { BaseDocument } from './base.type';
import { DataDocument } from './method.type';
import { MongodbOperationImplements } from './mongodb.interface';

export function autoDetect(target: DataModel<any>, propertyKey: 'collectionName'): void {
	const modelName = target.constructor.name.replace(/Model$/, '');
	Object.assign(target, {
		[propertyKey]: modelName,
	});
}

export abstract class DataModel<IDocType extends BaseDocument> extends MongodbOperationImplements<IDocType> {
	public async getInstance(idObj: ObjectId|string|DataDocument<IDocType>): Promise<DataDocument<IDocType>> {
		if (typeof idObj === 'string' || idObj instanceof ObjectId) {
			return await this.getById(idObj);
		} else {
			return idObj;
		}
	}
}
