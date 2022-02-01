import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateSpace',
	params: {
		$id: 'https://felt.social/vocab/CreateSpaceParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
			name: {type: 'string'},
			url: {type: 'string'},
			media_type: {type: 'string'},
			view: {type: 'object', tsType: 'ViewData'},
		},
		required: ['community_id', 'name', 'url', 'media_type', 'view'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/CreateSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: 'Space.json', tsType: 'Space'},
		},
		required: ['space'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateSpaceResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'POST',
	},
};

export const ReadSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadSpace',
	params: {
		$id: 'https://felt.social/vocab/ReadSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/ReadSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: 'Space.json', tsType: 'Space'},
		},
		required: ['space'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'GET',
	},
};

export const ReadSpaces: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadSpaces',
	params: {
		$id: 'https://felt.social/vocab/ReadSpacesParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
		},
		required: ['community_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/ReadSpacesResponse.json',
		type: 'object',
		properties: {
			spaces: {type: 'array', items: {$ref: 'Space.json', tsType: 'Space'}},
		},
		required: ['spaces'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadSpacesResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'GET',
	},
};

export const DeleteSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteSpace',
	params: {
		$id: 'https://felt.social/vocab/DeleteSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/DeleteSpaceResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'DELETE',
	},
};

export const events: EventInfo[] = [CreateSpace, ReadSpace, ReadSpaces, DeleteSpace];
