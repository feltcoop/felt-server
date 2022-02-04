import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO probably belongs elsewhere
export const Ping: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Ping',
	params: {
		$id: '/schemas/PingParams.json',
		type: 'null',
		tsType: 'void',
	},
	response: {
		$id: '/schemas/PingResponse.json',
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
			$id: '/schemas/SetMobileParams.json',
			type: 'boolean',
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'OpenDialog',
		params: {
			$id: '/schemas/OpenDialogParams.json',
			allOf: [{$ref: '/schemas/DialogData.json'}],
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
			$id: '/schemas/SelectPersonaParams.json',
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
			$id: '/schemas/SelectCommunityParams.json',
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
			$id: '/schemas/SelectSpaceParams.json',
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
			$id: '/schemas/ViewSpaceParams.json',
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
