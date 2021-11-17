import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

const CreateCommunityResponseResult = `{
	community: Community;
}`;
export const create_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_community',
	params: {
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
		type: `ApiResult<${CreateCommunityResponseResult}>`,
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
	returns: `Promise<ApiResult<${CreateCommunityResponseResult}>>`,
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

const ReadCommunityResponseResult = `{
	community: Community;
}`;
export const read_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_community',
	params: {
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
		type: `ApiResult<${ReadCommunityResponseResult}>`,
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
	returns: `Promise<ApiResult<${ReadCommunityResponseResult}>>`,
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
};

const ReadCommunitiesResponseResult = `{
	communities: Community[];
}`;
export const read_communities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_communities',
	params: {
		schema: {
			$id: 'https://felt.social/vocab/read_communities_params.json',
			type: 'object',
			properties: {},
			required: [],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${ReadCommunitiesResponseResult}>`,
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
	returns: `Promise<ApiResult<${ReadCommunitiesResponseResult}>>`,
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
};

export const events: EventInfo[] = [create_community, read_community, read_communities];
