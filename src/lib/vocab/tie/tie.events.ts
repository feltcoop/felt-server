import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateTie: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateTie',
	params: {
		$id: '/schemas/CreateTieParams.json',
		type: 'object',
		properties: {
			source_id: {type: 'number'},
			dest_id: {type: 'number'},
			type: {type: 'string'},
		},
		required: ['source_id', 'dest_id', 'type'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateTieResponse.json',
		type: 'object',
		properties: {
			tie: {$ref: '/schemas/Tie.json', tsType: 'Tie'},
		},
		required: ['tie'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateTieResponseResult>',
	route: {
		path: '/api/v1/ties',
		method: 'POST',
	},
};

export const events: EventInfo[] = [CreateTie];
