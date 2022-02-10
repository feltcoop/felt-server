import {type ArgsSchema} from '@feltcoop/gro/dist/task/task.js';

export const DbCreateTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/DbCreateTaskArgs.json',
	type: 'object',
	properties: {
		seed: {type: 'boolean', default: true},
		'no-seed': {
			type: 'boolean',
			default: false,
			description: 'opt out of seeding',
		},
	},
	additionalProperties: false,
};
