import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';
import {CommunitySettingsSchema} from '$lib/vocab/community/community';

export const CreateCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateCommunity',
	params: {
		$id: 'https://felt.social/vocab/CreateCommunityParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
			persona_id: {type: 'number'},
			settings: CommunitySettingsSchema,
		},
		required: ['name', 'persona_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/CreateCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: 'Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: 'Space.json', tsType: 'Space'}},
		},
		required: ['community', 'spaces'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateCommunityResponseResult>',
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

export const ReadCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadCommunity',
	params: {
		$id: 'https://felt.social/vocab/ReadCommunityParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
		},
		required: ['community_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/ReadCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: 'Community.json', tsType: 'Community'},
		},
		required: ['community'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadCommunityResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
};

export const ReadCommunities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadCommunities',
	params: {
		$id: 'https://felt.social/vocab/ReadCommunitiesParams.json',
		type: 'object',
		properties: {},
		required: [],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/ReadCommunitiesResponse.json',
		type: 'object',
		properties: {
			communities: {type: 'array', items: {$ref: 'Community.json', tsType: 'Community'}},
		},
		required: ['communities'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadCommunitiesResponseResult>',
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
};

export const UpdateCommunitySettings: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateCommunitySettings',
	params: {
		$id: 'https://felt.social/vocab/UpdateCommunitySettingsParams.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
			settings: CommunitySettingsSchema,
		},
		required: ['community_id', 'settings'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/UpdateCommunitySettingsResponse.json',
		type: 'null',
	},
	returns: 'Promise<UpdateCommunitySettingsResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id/settings',
		method: 'POST',
	},
};

export const events: EventInfo[] = [
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
];
