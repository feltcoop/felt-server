import type {SvelteComponent} from 'svelte';

import type {SpaceType} from '$lib/vocab/space/space';
import Home from '$lib/ui/Home.svelte';
import Room from '$lib/ui/Room.svelte';
import Board from '$lib/ui/Board.svelte';
import Forum from '$lib/ui/Forum.svelte';
import Notes from '$lib/ui/Notes.svelte';
import Iframe from '$lib/ui/Iframe.svelte';
import Voice from '$lib/ui/Voice.svelte';

export const spaceViews: Record<SpaceType, typeof SvelteComponent> = {
	Home,
	Room,
	Board,
	Forum,
	Notes,
	Voice,
	Iframe,
};
