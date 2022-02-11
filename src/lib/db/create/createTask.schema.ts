import {type ArgsSchema} from '@feltcoop/gro';

export const DbCreateTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/DbCreateTaskArgs.json',
	type: 'object',
	properties: {
		seed: {type: 'boolean', default: true, description: ''},
		'no-seed': {
			type: 'boolean',
			default: false,
			description: 'opt out of seeding',
		},
	},
	additionalProperties: false,
};
