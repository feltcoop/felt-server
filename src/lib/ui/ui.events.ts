import type {ClientEventInfo} from '$lib/vocab/event/event';

// TODO keep extracting these events to other events files
// (which are then imported in $lib/ui/events.gen.ts)
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
