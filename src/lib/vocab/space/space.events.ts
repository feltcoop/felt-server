import type {EventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_space_params_type = `{
	community_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}`;
const create_space_response_type = '{space: Space}';
export const create_space: EventInfo = {
	name: 'create_space',
	params: {
		type: create_space_params_type,
		schema: {
			$id: 'create_space_params',
			properties: {
				community_id: {type: 'number'},
				name: {type: 'string'},
				url: {type: 'string'},
				media_type: {type: 'string'},
				content: {type: 'string'},
			},
			required: ['community_id', 'name', 'url', 'media_type', 'content'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_space_response_type}>`,
		schema: {
			$id: 'create_space_response',
			properties: {
				space: {$ref: '#/$defs/space'},
			},
			required: ['space'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_space_response_type}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'POST',
	},
};

export const events = [create_space];
