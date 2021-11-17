import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

const CreateMembershipResponseResult = '{membership: Membership}';
export const create_membership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_membership',
	params: {
		schema: {
			$id: 'https://felt.social/vocab/create_membership_params.json',
			type: 'object',
			properties: {
				persona_id: {type: 'number'},
				community_id: {type: 'number'},
			},
			required: ['persona_id', 'community_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${CreateMembershipResponseResult}>`,
		schema: {
			$id: 'https://felt.social/vocab/create_membership_response.json',
			type: 'object',
			properties: {
				membership: {$ref: 'Membership.json'},
			},
			required: ['membership'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${CreateMembershipResponseResult}>>`,
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
};

export const events: EventInfo[] = [create_membership];
