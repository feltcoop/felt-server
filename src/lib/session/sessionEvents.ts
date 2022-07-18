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
				// TODO it'd be nice to have schema validation here,
				// but currently the `ClientSession` is a manually-synced type.
				// This would be good for security because the server could validate the data
				// returned from `loadClientSession`.
				tsType: 'ClientSession',
			},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'void',
};
