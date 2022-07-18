import type {ClientEventInfo} from '$lib/vocab/event/event';

export const SetSession: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'SetSession',
	params: {
		$id: '/schemas/SetSessionParams.json',
		type: 'object',
		properties: {
			session: {
				type: 'object',
				tsType: 'ClientSession',
			},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'void',
};
