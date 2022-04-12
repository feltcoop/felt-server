import type {ArgsSchema} from '@feltcoop/gro';

export const SetupTaskArgsSchema: ArgsSchema = {
	$id: '/schemas/LocalSetupTaskArgs.json',
	type: 'object',
	properties: {
		dry: {
			type: 'boolean',
			default: false,
			description: 'log the generated script instead of executing it',
		},
	},
	required: [],
	additionalProperties: false,
};
