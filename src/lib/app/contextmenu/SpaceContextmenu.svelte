<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import SpaceDelete from '$lib/ui/SpaceDelete.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';

	const {dispatch} = getApp();

	export let space: Readable<Space>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<span class="menu-item-entry">
			<SpaceIcon {space} />
			<span class="title">{$space.name}</span>
		</span>
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: SpaceDelete,
					props: {space, done: () => dispatch('CloseDialog')},
				})}
		>
			<span class="title"> Delete Space </span>
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch('ViewSpace', {
					space,
					view: {type: 'EntityExplorer'},
				})}
		>
			<span class="title">View with EntityExplorer</span>
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
