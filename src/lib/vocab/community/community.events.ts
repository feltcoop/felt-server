import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_community_params_type = `{
	name: string;
	persona_id: number;
}`;
const create_community_response_type = `{
	community: Community;
}`;
export const create_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_community',
	params: {
		type: create_community_params_type,
		schema: {
			$id: 'https://felt.social/vocab/create_community_params.json',
			type: 'object',
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
			$id: 'https://felt.social/vocab/create_community_response.json',
			type: 'object',
			properties: {
				community: {$ref: 'Community.json'},
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
export const read_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_community',
	params: {
		type: read_community_params_type,
		schema: {
			$id: 'https://felt.social/vocab/read_community_params.json',
			type: 'object',
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
			$id: 'https://felt.social/vocab/read_community_response.json',
			type: 'object',
			properties: {
				community: {$ref: 'Community.json'},
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
export const read_communities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_communities',
	params: {
		type: read_communities_params_type,
		schema: {
			$id: 'https://felt.social/vocab/read_communities_params.json',
			type: 'object',
			properties: {},
			required: [],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${read_communities_response_type}>`,
		schema: {
			$id: 'https://felt.social/vocab/read_communities_response.json',
			type: 'object',
			properties: {
				communities: {type: 'array', items: {$ref: 'Community.json'}},
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

export const events: EventInfo[] = [create_community, read_community, read_communities];
