import { Document, Schema } from 'mongoose';

export interface TypedDocument<T extends BaseDocument> extends Document {
	toObject(): T;
}

export interface UpdateResult {
	n: number;
	nModified: number;
	ok: number;
}

export type BasicTypes = typeof Function|typeof Boolean|typeof Number|typeof String|typeof Object|any;
export type MongoObj<T extends BaseDocument> = T&TypedDocument<T>;

export interface BaseDocument {
	_id?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export const baseSchema = {
	_id: Schema.Types.ObjectId,
	createdAt: Date,
	updatedAt: Date,
};

