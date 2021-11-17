import type {ClientEventInfo} from '$lib/vocab/event/event';

export const events: ClientEventInfo[] = [
	{
		type: 'ClientEvent',
		name: 'toggle_main_nav',
		params: {
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'toggle_secondary_nav',
		params: {
			schema: null,
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_main_nav_view',
		params: {
			schema: {
				// TODO this is the type `MainNavView` -- should that be represented in a schema?
				$id: 'https://felt.social/vocab/set_main_nav_view_params.json',
				enum: ['explorer', 'account'],
			},
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'set_mobile',
		params: {
			schema: {
				$id: 'https://felt.social/vocab/set_mobile_params.json',
				type: 'boolean',
			},
		},
		returns: 'void',
	},
	{
		type: 'ClientEvent',
		name: 'select_persona',
		params: {
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
