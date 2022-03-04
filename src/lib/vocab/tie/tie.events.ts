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

export const ReadTies: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadTies',
	params: {
		$id: '/schemas/ReadTiesParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadTiesResponse.json',
		type: 'object',
		properties: {
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
		},
		required: ['ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadTiesResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/ties',
		method: 'GET',
	},
};

export const events: EventInfo[] = [CreateTie, ReadTies];
