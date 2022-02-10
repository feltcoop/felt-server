import {type ArgsSchema} from '@feltcoop/gro/dist/task/task.js';
import {CheckTaskArgsSchema as BaseSchema} from '@feltcoop/gro/dist/checkTask.schema.js';

export const CheckTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/LocalCheckTaskArgs.json',
	type: 'object',
	properties: {
		migrations: {type: 'boolean', default: true},
		'no-migrations': {
			type: 'boolean',
			default: false,
			description: 'opt out of migrations check',
		},
		...BaseSchema.properties,
	},
	required: BaseSchema.required,
	additionalProperties: false,
};
