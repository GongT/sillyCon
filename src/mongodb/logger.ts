import { createLogger, IDebugger } from '@gongt/silly-b/dist/debug/create-logger';
import { LOG_LEVEL } from '@gongt/silly-b/dist/debug/levels';

/** @internal */
export function createLoggerBundle(title: string): IDebuggerBundle {
	const levels = [
		LOG_LEVEL.EMERG,
		LOG_LEVEL.ERROR,
		LOG_LEVEL.WARN,
		LOG_LEVEL.NOTICE,
		LOG_LEVEL.INFO,
		LOG_LEVEL.DEBUG,
		LOG_LEVEL.DATA,
		LOG_LEVEL.SILLY,
	];
	const ret: any = {};
	for (const level of levels) {
		ret[LOG_LEVEL[level].toLowerCase()] = createLogger(level, title);
	}
	return ret;
}

/** @internal */
export interface IDebuggerBundle {
	data: IDebugger;
	debug: IDebugger;
	emerg: IDebugger;
	error: IDebugger;
	info: IDebugger;
	notice: IDebugger;
	silly: IDebugger;
	warn: IDebugger;
}
