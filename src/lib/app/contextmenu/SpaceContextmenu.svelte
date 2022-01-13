<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';
	import {type Space} from '$lib/vocab/space/space';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	let space: Readable<Space>;
	$: space = $contextmenu.items.SpaceContextmenu;
</script>

<div class="markup">
	<p>
		{$space.name}
	</p>
</div>
<button
	type="button"
	class="menu-button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'SpaceDelete',
			props: {space, done: () => dispatch('CloseDialog')},
		})}
>
	Delete Space
</button>

<button
	type="button"
	class="menu-button"
	on:click={() =>
		dispatch('ViewSpace', {
			space,
			view: {type: 'EntityExplorer'},
		})}
>
	View with EntityExplorer
</button>
