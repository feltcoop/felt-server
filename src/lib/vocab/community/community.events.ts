import type {EventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_community_params_type = `{
	name: string;
	persona_id: number;
}`;
const create_community_response_type = `{
	community: Community;
}`;
export const create_community: EventInfo = {
	name: 'create_community',
	params: {
		type: create_community_params_type,
		schema: {
			$id: 'create_community_params',
			properties: {
				name: {type: 'string'},
				persona_id: {type: 'number'},
			},
			required: ['name', 'persona_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_community_response_type}>`,
		schema: {
			$id: 'create_community_response',
			properties: {
				community: {$ref: '#/$defs/community'},
			},
			required: ['community'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_community_response_type}>>`,
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

const read_community_params_type = `{
	community_id: number;
}`;
const read_community_response_type = `{
	community: Community;
}`;
export const read_community: EventInfo = {
	name: 'read_community',
	params: {
		type: read_community_params_type,
		schema: {
			$id: 'read_community_params',
			properties: {
				community_id: {type: 'number'},
			},
			required: ['community_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${read_community_response_type}>`,
		schema: {
			$id: 'read_community_response',
			properties: {
				community: {$ref: '#/$defs/community'},
			},
			required: ['community'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${read_community_response_type}>>`,
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
};

const read_communities_params_type = `{
}`;
const read_communities_response_type = `{
	communities: Community[];
}`;
export const read_communities: EventInfo = {
	name: 'read_communities',
	params: {
		type: read_communities_params_type,
		schema: {
			$id: 'read_communities_params',
			properties: {
				community_id: {type: 'number'},
			},
			required: ['community_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${read_communities_response_type}>`,
		schema: {
			$id: 'read_communities_response',
			properties: {
				communities: {type: 'array', items: {$ref: '#/$defs/community'}},
			},
			required: ['communities'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${read_communities_response_type}>>`,
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
};

export const events = [create_community, read_community, read_communities];