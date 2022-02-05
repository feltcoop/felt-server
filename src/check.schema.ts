import {type ArgsSchema} from '@feltcoop/gro/dist/task/task.js';

export const CheckTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/LocalCheckTaskArgs.json', // TODO how to avoid collisions?
	type: 'object',
	allOf: [
		{$ref: '/schemas/CheckTaskArgs.json'},
		{
			migrations: {type: 'boolean', default: true, description: ''},
			'no-migrations': {
				type: 'boolean',
				default: false,
				description: 'opt out of migrations check',
			},
		},
	],
	additionalProperties: false,
};
