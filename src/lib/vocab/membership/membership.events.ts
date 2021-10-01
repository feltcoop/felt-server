import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_membership_params_type = '{persona_id: number; community_id: number}';
const create_membership_response_type = '{membership: Membership}';
export const create_membership: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_membership',
	params: {
		type: create_membership_params_type,
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
		type: `ApiResult<${create_membership_response_type}>`,
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
	returns: `Promise<ApiResult<${create_membership_response_type}>>`,
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
};

export const events: EventInfo[] = [create_membership];
