import {type SvelteComponent} from 'svelte';

import AppContextmenu from '$lib/app/contextmenu/AppContextmenu.svelte';
import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';
import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
import LinkContextmenu from '$lib/app/contextmenu/LinkContextmenu.svelte';
import LuggageContextmenu from '$lib/app/contextmenu/LuggageContextmenu.svelte';
import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
import ActingPersonaContextmenu from '$lib/app/contextmenu/ActingPersonaContextmenu.svelte';
import SpaceContextmenu from '$lib/app/contextmenu/SpaceContextmenu.svelte';

// TODO should ideally dynamically load these -- see `$lib/app/components` for more
export const contextmenuComponents: {[key: string]: typeof SvelteComponent} = {
	AppContextmenu,
	CommunityContextmenu,
	EntityContextmenu,
	LinkContextmenu,
	LuggageContextmenu,
	PersonaContextmenu,
	ActingPersonaContextmenu,
	SpaceContextmenu,
};
