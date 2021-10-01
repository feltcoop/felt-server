import type {EventData} from '$lib/vocab/event/event';

// TODO keep extracting these events to other events files
// (which are then imported in $lib/ui/events.gen.ts)
export const events: EventData[] = [
	{
		name: 'toggle_main_nav',
		params: {
			type: 'void',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'toggle_secondary_nav',
		params: {
			type: 'void',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'set_main_nav_view',
		params: {
			type: 'MainNavView',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'set_mobile',
		params: {
			type: 'boolean',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_persona',
		params: {
			type: '{persona_id: number}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_community',
		params: {
			type: '{community_id: number | null}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_space',
		params: {
			type: '{community_id: number, space_id: number}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
];
