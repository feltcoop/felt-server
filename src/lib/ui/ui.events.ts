import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO probably belongs elsewhere
export const Ping: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Ping',
	params: {
		$id: 'https://felt.social/vocab/PingParams.json',
		type: 'null',
		tsType: 'void',
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
	Ping,
	{
		type: 'ClientEvent',
		name: 'ToggleMainNav',
		params: null,
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'ToggleSecondaryNav',
		params: null,
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'SetMobile',
		params: {
			$id: 'https://felt.social/vocab/SetMobileParams.json',
			type: 'boolean',
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'OpenDialog',
		params: {
			$id: 'https://felt.social/vocab/OpenDialogParams.json',
			type: 'object',
			properties: {
				Component: {type: 'object', tsType: 'typeof SvelteComponent'},
				props: {type: 'object'},
			},
			required: ['Component'],
			additionalProperties: false,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'CloseDialog',
		params: null,
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'SelectPersona',
		params: {
			$id: 'https://felt.social/vocab/SelectPersonaParams.json',
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
		name: 'SelectCommunity',
		params: {
			$id: 'https://felt.social/vocab/SelectCommunityParams.json',
			type: 'object',
			properties: {
				community_id: {type: ['number', 'null']},
			},
			required: ['community_id'],
			additionalProperties: false,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'SelectSpace',
		params: {
			$id: 'https://felt.social/vocab/SelectSpaceParams.json',
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
	{
		type: 'ClientEvent',
		name: 'ViewSpace',
		params: {
			$id: 'https://felt.social/vocab/ViewSpaceParams.json',
			type: 'object',
			properties: {
				space: {type: 'object', tsType: 'Readable<Space>'},
				view: {type: ['object', 'null'], tsType: 'ViewData | null'},
			},
			required: ['space', 'view'],
			additionalProperties: false,
		},
		returns: 'void',
	},
];
