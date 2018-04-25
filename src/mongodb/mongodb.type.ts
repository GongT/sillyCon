export interface MongoUpdate<T> {
	[id: string]: any;
}

export type MongoProjection<T extends string> = T[]|Record<T, string>;

