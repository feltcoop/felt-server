import type {ClientEventInfo} from '$lib/vocab/event/event';

export const SetSession: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'SetSession',
	params: {
		$id: '/schemas/ClientSession.json',
		type: 'object',
		// TODO need schema
		// properties: {
		// 	source_id: {type: 'number'},
		// },
		// required: ['source_id'],
		// additionalProperties: false,
	},
	returns: 'void',
};
