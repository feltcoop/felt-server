import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateMembership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateMembership',
	params: {
		$id: '/schemas/CreateMembershipParams.json',
		type: 'object',
		properties: {
			persona_id: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['persona_id', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateMembershipResponse.json',
		type: 'object',
		properties: {
			membership: {$ref: '/schemas/Membership.json', tsType: 'Membership'},
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

export const DeleteMembership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteMembership',
	params: {
		$id: '/schemas/DeleteMembershipParams.json',
		type: 'object',
		properties: {
			persona_id: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['persona_id', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteMembershipResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteMembershipResponseResult>',
	route: {
		path: '/api/v1/memberships',
		method: 'DELETE',
	},
};

export const events: EventInfo[] = [CreateMembership, DeleteMembership];
