import {type ArgsSchema} from '@feltcoop/gro';

export const DbTestMigrationTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/DbTestMigrationTaskArgs.json',
	type: 'object',
	properties: {
		checkpoint: {
			type: 'boolean',
			default: false,
			description: 'if `true`, does not run the `count` number of final migrations',
		},
		count: {
			type: 'number',
			default: 1,
			description: 'number of migrations being tested; rarely might need more than 1',
		},
	},
	additionalProperties: false,
};
