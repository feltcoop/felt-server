import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

const CreateSpaceResponseResult = '{space: Space}';
export const create_space: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_space',
	params: {
		schema: {
			$id: 'https://felt.social/vocab/create_space_params.json',
			type: 'object',
			properties: {
				community_id: {type: 'number'},
				name: {type: 'string'},
				url: {type: 'string'},
				media_type: {type: 'string'},
				content: {type: 'string'},
			},
			required: ['community_id', 'name', 'url', 'media_type', 'content'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${CreateSpaceResponseResult}>`,
		schema: {
			$id: 'https://felt.social/vocab/create_space_response.json',
			type: 'object',
			properties: {
				space: {$ref: 'Space.json'},
			},
			required: ['space'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${CreateSpaceResponseResult}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'POST',
	},
};

const ReadSpaceResponseResult = '{space: Space}';
export const read_space: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_space',
	params: {
		schema: {
			$id: 'https://felt.social/vocab/read_space_params.json',
			type: 'object',
			properties: {
				space_id: {type: 'number'},
			},
			required: ['space_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${ReadSpaceResponseResult}>`,
		schema: {
			$id: 'https://felt.social/vocab/read_space_response.json',
			type: 'object',
			properties: {
				space: {$ref: 'Space.json'},
			},
			required: ['space'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${ReadSpaceResponseResult}>>`,
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'GET',
	},
};

const ReadSpacesResponseResult = '{spaces: Space[]}';
export const read_spaces: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_spaces',
	params: {
		schema: {
			$id: 'https://felt.social/vocab/read_spaces_params.json',
			type: 'object',
			properties: {
				community_id: {type: 'number'},
			},
			required: ['community_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${ReadSpacesResponseResult}>`,
		schema: {
			$id: 'https://felt.social/vocab/read_spaces_response.json',
			type: 'object',
			properties: {
				spaces: {type: 'array', items: {$ref: 'Space.json'}},
			},
			required: ['spaces'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${ReadSpacesResponseResult}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'GET',
	},
};

export const events: EventInfo[] = [create_space, read_space, read_spaces];
