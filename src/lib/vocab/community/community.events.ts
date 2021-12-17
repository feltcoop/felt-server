import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';
import {CommunitySettingsSchema} from '$lib/vocab/community/community';

export const create_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_community',
	params: {
		$id: 'https://felt.social/vocab/create_community_params.json',
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
		$id: 'https://felt.social/vocab/create_community_response.json',
		type: 'object',
		properties: {
			community: {$ref: 'Community.json', tsType: 'Community'},
		},
		required: ['community'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateCommunityResponseResult>',
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

export const read_community: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_community',
	params: {
		$id: 'https://felt.social/vocab/read_community_params.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
		},
		required: ['community_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/read_community_response.json',
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

export const read_communities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_communities',
	params: {
		$id: 'https://felt.social/vocab/read_communities_params.json',
		type: 'object',
		properties: {},
		required: [],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/read_communities_response.json',
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

export const update_community_settings: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'update_community_settings',
	params: {
		$id: 'https://felt.social/vocab/update_community_settings_params.json',
		type: 'object',
		properties: {
			community_id: {type: 'number'},
			settings: CommunitySettingsSchema,
		},
		required: ['community_id', 'settings'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/update_community_settings_response.json',
		type: 'null',
	},
	returns: 'Promise<UpdateCommunitySettingsResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id/settings',
		method: 'POST',
	},
};

export const events: EventInfo[] = [
	create_community,
	read_community,
	read_communities,
	update_community_settings,
];
