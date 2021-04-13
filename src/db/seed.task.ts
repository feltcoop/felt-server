import type {Task} from '@feltcoop/gro';
import {seed} from './seed.js';

export const task: Task = {
	description: 'add initial dataset to the the database',
	run: async ({invokeTask}) => {
		await seed(server);
	},
};
