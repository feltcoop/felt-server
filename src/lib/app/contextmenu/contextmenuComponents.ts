import {type SvelteComponent} from 'svelte';

import AppContextmenu from '$lib/app/contextmenu/AppContextmenu.svelte';
import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';
import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
import LinkContextmenu from '$lib/app/contextmenu/LinkContextmenu.svelte';
import LuggageContextmenu from '$lib/app/contextmenu/LuggageContextmenu.svelte';
import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
import SpaceContextmenu from '$lib/app/contextmenu/SpaceContextmenu.svelte';

// TODO consider making the keys the name of the component
// TODO dyanamically load, eventually, probably -- see `$lib/app/components` for a similar problem
export const contextmenuComponents: {[key: string]: typeof SvelteComponent} = {
	app: AppContextmenu,
	community: CommunityContextmenu,
	entity: EntityContextmenu,
	link: LinkContextmenu,
	luggage: LuggageContextmenu,
	persona: PersonaContextmenu,
	space: SpaceContextmenu,
};
