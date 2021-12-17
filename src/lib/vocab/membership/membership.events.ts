import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const create_membership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_membership',
	params: {
		$id: 'https://felt.social/vocab/create_membership_params.json',
		type: 'object',
		properties: {
			persona_id: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['persona_id', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/create_membership_response.json',
		type: 'object',
		properties: {
			membership: {$ref: 'Membership.json', tsType: 'Membership'},
		},
		required: ['membership'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateMembershipResponseResult>',
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
};

export const delete_membership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'delete_membership',
	params: {
		$id: 'https://felt.social/vocab/delete_membership_params.json',
		type: 'object',
		properties: {
			persona_id: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['persona_id', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/delete_membership_response.json',
		type: 'null',
	},
	returns: 'Promise<DeleteMembershipResponseResult>',
	route: {
		path: '/api/v1/memberships',
		method: 'DELETE',
	},
};

export const events: EventInfo[] = [create_membership, delete_membership];
