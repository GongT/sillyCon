import { DataModel } from './mongodb';

export function forceExtractRawModel<T>(model: DataModel<T>): DataModel<T>['model'] {
	return (model as any).model;
}
