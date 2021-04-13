import type {Task} from '@feltcoop/gro';

// name? maybe `init` or `reset` is clearer?

const DB_DIRNAME = 'db';
const MIGRATIONS_DIRNAME = `${DB_DIRNAME}/migrations`;

export const task: Task = {
	description: 'create the database from scratch and reset all data',
	run: async ({invokeTask}) => {
		const [_, unobtainSql] = obtainSql();
		await invokeTask('db/destroy');
		await invokeTask('db/up');
		await invokeTask('db/seed');
		unobtainSql();
	},
};
