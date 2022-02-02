<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import SpaceDelete from '$lib/ui/SpaceDelete.svelte';

	const {dispatch} = getApp();

	export let space: Readable<Space>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		{$space.name}
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: SpaceDelete,
					props: {space, done: () => dispatch('CloseDialog')},
				})}
		>
			Delete Space
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch('ViewSpace', {
					space,
					view: {type: 'EntityExplorer'},
				})}
		>
			View with EntityExplorer
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
