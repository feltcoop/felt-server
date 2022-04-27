import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/CreateSpaceParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
			name: {type: 'string'},
			url: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['community_id', 'name', 'url', 'icon', 'view'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space.json', tsType: 'Space'},
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
		$id: '/schemas/ReadSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space.json', tsType: 'Space'},
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
		$id: '/schemas/ReadSpacesParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
		},
		required: ['community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadSpacesResponse.json',
		type: 'object',
		properties: {
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
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

export const UpdateSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
			name: {type: 'string'},
			url: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space.json', tsType: 'Space'},
		},
		required: ['space'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'POST',
	},
};

export const DeleteSpace: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteSpace',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteSpaceResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'DELETE',
	},
};
