import type {SvelteComponent} from 'svelte';

import type {ViewType} from '$lib/vocab/view/view';
import Home from '$lib/ui/view/Home.svelte';
import Room from '$lib/ui/view/Room.svelte';
import Board from '$lib/ui/view/Board.svelte';
import Forum from '$lib/ui/view/Forum.svelte';
import Notes from '$lib/ui/view/Notes.svelte';
import Iframe from '$lib/ui/view/Iframe.svelte';
import Voice from '$lib/ui/view/Voice.svelte';

export const viewComponents: Record<ViewType, typeof SvelteComponent> = {
	Home,
	Room,
	Board,
	Forum,
	Notes,
	Voice,
	Iframe,
};
