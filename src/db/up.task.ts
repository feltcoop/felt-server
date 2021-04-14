import type {Task} from '@feltcoop/gro';
import ley from 'ley';

import {obtainDb} from './obtainDb.js';
import {toLeyUpOptions} from './ley.js';

export interface TaskArgs {
	single?: boolean;
}

export const task: Task<TaskArgs> = {
	description: 'run all database migrations',
	run: async ({args}) => {
		const single = !!args.single;
		const [_, unobtainDb] = obtainDb();
		await ley.up(toLeyUpOptions(single));
		unobtainDb();
	},
};
