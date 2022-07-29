import type {SvelteComponent} from 'svelte';

import Admin from '$lib/ui/view/Admin.svelte';
import Home from '$lib/ui/view/Home.svelte';
import Room from '$lib/ui/view/Room.svelte';
import Board from '$lib/ui/view/Board.svelte';
import Forum from '$lib/ui/view/Forum.svelte';
import Notes from '$lib/ui/view/Notes.svelte';
import Iframe from '$lib/ui/view/Iframe.svelte';
import EntityExplorer from '$lib/ui/view/EntityExplorer.svelte';
import Todo from '$lib/ui/view/Todo.svelte';

export const viewComponents: Record<string, typeof SvelteComponent> = {
	Admin,
	Home,
	Room,
	Board,
	Forum,
	Notes,
	Iframe,
	EntityExplorer,
	Todo,
};
