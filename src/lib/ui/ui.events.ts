import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const ping: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ping',
	params: {
		type: 'void',
		schema: {
			$id: 'https://felt.social/vocab/ping_params.json',
			type: 'null',
		},
	},
	response: {
		type: `ApiResult<null>`,
		schema: {
			$id: 'https://felt.social/vocab/ping_response.json',
			type: 'null',
		},
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
		params: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'toggle_secondary_nav',
		params: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_main_nav_view',
		params: {
			type: 'MainNavView',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_mobile',
		params: {
			type: 'boolean',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_persona',
		params: {
			type: '{persona_id: number}',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_community',
		params: {
			type: '{community_id: number | null}',
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_space',
		params: {
			type: '{community_id: number, space_id: number}',
			schema: null,
		},
		returns: 'void',
	},
];
