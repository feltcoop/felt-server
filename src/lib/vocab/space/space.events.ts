import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_space_params_type = `{
	community_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}`;
const create_space_response_type = '{space: Space}';
export const create_space: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_space',
	params: {
		type: create_space_params_type,
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
		type: `ApiResult<${create_space_response_type}>`,
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
	returns: `Promise<ApiResult<${create_space_response_type}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'POST',
	},
};

const read_space_params_type = `{
	space_id: number;
}`;
const read_space_response_type = '{space: Space}';
export const read_space: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_space',
	params: {
		type: read_space_params_type,
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
		type: `ApiResult<${read_space_response_type}>`,
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
	returns: `Promise<ApiResult<${read_space_response_type}>>`,
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'GET',
	},
};

const read_spaces_params_type = `{
	community_id: number;
}`;
const read_spaces_response_type = '{spaces: Space[]}';
export const read_spaces: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_spaces',
	params: {
		type: read_spaces_params_type,
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
		type: `ApiResult<${read_spaces_response_type}>`,
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
	returns: `Promise<ApiResult<${read_spaces_response_type}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'GET',
	},
};

export const events: EventInfo[] = [create_space, read_space, read_spaces];
