import type {ClientEventInfo} from '$lib/vocab/event/event';

export const events: ClientEventInfo[] = [
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
			schema: {
				$id: 'https://felt.social/vocab/select_persona_params.json',
				type: 'object',
				properties: {
					persona_id: {type: 'number'},
				},
				required: ['persona_id'],
				additionalProperties: false,
			},
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_community',
		params: {
			type: '{community_id: number | null}',
			schema: {
				$id: 'https://felt.social/vocab/select_community_params.json',
				type: 'object',
				properties: {
					community_id: {anyOf: [{type: 'number'}, {type: 'null'}]},
				},
				required: ['community_id'],
				additionalProperties: false,
			},
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_space',
		params: {
			type: '{community_id: number, space_id: number}',
			schema: {
				$id: 'https://felt.social/vocab/select_space_params.json',
				type: 'object',
				properties: {
					community_id: {type: 'number'},
					space_id: {type: 'number'},
				},
				required: ['community_id', 'space_id'],
				additionalProperties: false,
			},
		},
		returns: 'void',
	},
];
