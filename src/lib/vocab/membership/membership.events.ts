import type {EventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_membership_params_type = '{persona_id: number; community_id: number}';
const create_membership_response_type = '{membership: Membership}';
export const create_membership: EventInfo = {
	name: 'create_membership',
	params: {
		type: create_membership_params_type,
		schema: {
			$id: 'create_membership_params',
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
			$id: 'create_membership_response',
			properties: {
				membership: {$ref: '#/$defs/membership'},
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

export const events = [create_membership];
