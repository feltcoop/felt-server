import type {Task} from '@feltcoop/gro';
import ley from 'ley';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
	seed?: boolean; // defaults to `true`
}

export const task: Task<TaskArgs> = {
	summary: 'create the database from scratch, deleting and seeding data',
	run: async ({invokeTask}) => {
		const successes = await ley.up({dir: 'migrations', driver: 'postgres'});
		console.log(successes);
		const status = await ley.status({dir: 'migrations', driver: 'postgres'});
		console.log(status);
	},
};
