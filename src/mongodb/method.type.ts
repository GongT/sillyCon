import { Connection, Model, ModelUpdateOptions, Schema, SchemaDefinition, SchemaOptions, } from 'mongoose';
import { BaseDocument, TypedDocument, UpdateResult } from './base.type';
import { debugPromise, debugStart } from './debug';
import { createLoggerBundle, IDebuggerBundle } from './logger';
import { sillyConfig } from '../config/storage';
import { parse } from 'url';
import { getMongodbUrl } from './multiple';
import { ObjectId } from 'mongodb';
import { inspect, InspectOptions } from 'util';
import { findExistsModel, getConnection, globalSchemaHook, registerExistsModel, testDatabaseMuted } from './connect';

export type DataDocument<DocType> = DocType&TypedDocument<DocType>;

export abstract class DataModelAbstractMethods<IDocType extends BaseDocument> {
	public readonly connectionName: string;
	public readonly connectionUrl: string;
	public readonly log: Readonly<IDebuggerBundle>;
	
	protected model: Model<DataDocument<IDocType>>;
	protected displayName: string;
	
	protected readonly collectionName: string;
	protected abstract readonly schema: SchemaDefinition;
	protected readonly schemaOptions: Partial<SchemaOptions>;
	
	constructor(connectionName: string = sillyConfig.require('MongodbServer')) {
		const connection = getMongodbUrl(connectionName);
		if (!connection) {
			throw new Error('no such connection: ' + connectionName);
		}
		if (connectionName === connection) {
			const url = parse(connection);
			connectionName = url.host;
		}
		
		this.connectionName = connectionName;
		this.connectionUrl = connection;
		this.displayName = `<${this.modelName}@${connectionName}>`;
		
		this.log = createLoggerBundle('db:' + this.modelName.replace(/Model$/, ''));
		
		if (this.log.data.enabled) {
			this.wrapDebug('insert');
			this.wrapDebug('remove');
		}
		
		if (!testDatabaseMuted) {
			const callback = getConnection(this.connectionName, this.connectionUrl);
			callback.add(this.__init_database.bind(this));
		}
	}
	
	/** @internal */
	public [inspect.custom](depth: number, options: InspectOptions) {
		const padding = ' '.repeat(2 + depth * 2);
		return `{
${padding}Mongo::DataModel${this.displayName} table=${this.connectionName} }
`;
	}
	
	/** @internal */
	public toString() {
		return `[BaseMongo::DataModel ${this.displayName}]`;
	}
	
	public create(): DataDocument<IDocType> {
		const item = new this.model;
		item._id = new ObjectId;
		return item;
	}
	
	/** @internal */
	protected __init_database(connection: Connection) {
		this._namespace = connection.db.databaseName + '.' + this.collectionName;
		this.model = findExistsModel(connection, this.collectionName);
		if (this.model) {
			return;
		}
		this.log.silly('init new model: %s', this._namespace);
		
		const schema = new Schema(this.schema, <SchemaOptions> {
			...(this.schemaOptions || {}),
			collection: this.collectionName,
			minimize: false,
			typeKey: 'type',
			retainKeyOrder: true,
			timestamps: {
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
			},
		});
		
		globalSchemaHook.run(schema);
		this.schemaHook(schema);
		
		this.model = connection.model<DataDocument<IDocType>>(this.modelName, schema);
		registerExistsModel(connection, this.collectionName, this.model);
		
		this.log.info('prepared: [db=%s] [table=%s]', this.connectionName, this.collectionName);
		this.initialization();
	}
	
	/** only for overwrite */
	protected schemaHook(schemaObject: Schema) {
	}
	
	/** only for overwrite */
	protected initialization() {
	}
	
	protected upsert(conditions: Object, doc: Object, options: ModelUpdateOptions = {}): Promise<UpdateResult> {
		return this.model.update(conditions, doc, {
			multi: false,
			setDefaultsOnInsert: true,
			...options,
			upsert: true,
		}).exec();
	}
	
	protected wrapDebug(this: any, method: string) {
		const original = this[method];
		this[method] = (...args: any[]) => {
			debugStart(method, this.log.silly, args);
			const p = original.apply(this, args);
			debugPromise(method, this.log.data, this.log.error, p);
			return p;
		};
	}
	
	protected insert(content: IDocType) {
		const item = new this.model(content);
		item._id = new ObjectId();
		return item.save();
	}
	
	protected remove(doc: any): Promise<void> {
		return this.model.remove(doc).exec();
	}
	
	private _namespace: string;
	
	get namespace() {
		if (this._namespace) {
			return this._namespace;
		}
		throw new Error('please wait database to connect, before using any method.');
	}
	
	get modelName() {
		return this.constructor['name'];
	}
	
	get name() {
		return this.collectionName;
	}
}

