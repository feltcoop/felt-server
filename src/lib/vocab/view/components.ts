import type {SvelteComponent} from 'svelte';

import type {ViewType} from '$lib/vocab/view/view';
import Home from '$lib/vocab/view/Home.svelte';
import Room from '$lib/vocab/view/Room.svelte';
import Board from '$lib/vocab/view/Board.svelte';
import Forum from '$lib/vocab/view/Forum.svelte';
import Notes from '$lib/vocab/view/Notes.svelte';
import Iframe from '$lib/vocab/view/Iframe.svelte';
import Voice from '$lib/vocab/view/Voice.svelte';

export const viewComponents: Record<ViewType, typeof SvelteComponent> = {
	Home,
	Room,
	Board,
	Forum,
	Notes,
	Voice,
	Iframe,
};
