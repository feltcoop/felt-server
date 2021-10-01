import type {EventData} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_community_params_type = '{name: string; persona_id: number}';
const create_community_response_type = '{community: Community}'; // TODO declrs?
export const create_community: EventData = {
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

export const events = [create_community];
