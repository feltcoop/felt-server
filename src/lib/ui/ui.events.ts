import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO probably belongs elsewhere
export const ping: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ping',
	params: {
		$id: 'https://felt.social/vocab/PingParams.json',
		type: 'null',
		tsType: 'void', // makes it so we don't need to explicitly pass `null` -- is there a better way to do this?
	},
	response: {
		$id: 'https://felt.social/vocab/PingResponse.json',
		type: 'null',
	},
	returns: `Promise<ApiResult<null>>`,
	route: {
		path: '/api/v1/ping',
		method: 'GET',
	},
};

export const events: EventInfo[] = [
	ping,
	{
		type: 'ClientEvent',
		name: 'toggle_main_nav',
		params: null,
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'toggle_secondary_nav',
		params: null,
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_main_nav_view',
		params: {
			// TODO this is the type `MainNavView` -- should that be represented in a schema?
			$id: 'https://felt.social/vocab/set_main_nav_view_params.json',
			enum: ['explorer', 'account'],
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_mobile',
		params: {
			$id: 'https://felt.social/vocab/set_mobile_params.json',
			type: 'boolean',
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_persona',
		params: {
			$id: 'https://felt.social/vocab/select_persona_params.json',
			type: 'object',
			properties: {
				persona_id: {type: 'number'},
			},
			required: ['persona_id'],
			additionalProperties: false,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_community',
		params: {
			$id: 'https://felt.social/vocab/select_community_params.json',
			type: 'object',
			properties: {
				community_id: {anyOf: [{type: 'number'}, {type: 'null'}]},
			},
			required: ['community_id'],
			additionalProperties: false,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_space',
		params: {
			$id: 'https://felt.social/vocab/select_space_params.json',
			type: 'object',
			properties: {
				community_id: {type: 'number'},
				space_id: {type: 'number'},
			},
			required: ['community_id', 'space_id'],
			additionalProperties: false,
		},
		returns: 'void',
	},
];
