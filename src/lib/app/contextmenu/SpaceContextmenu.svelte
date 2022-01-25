<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';
	import ContextmenuSubmenuItem from '$lib/ui/contextmenu/ContextmenuSubmenuItem.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;
	export let menuIndex: number; // TODO infer this automatically everywhere it appears
	export let itemIndex: number; // TODO infer this automatically everywhere it appears
	export let space: Readable<Space>;
</script>

<ContextmenuSubmenuItem {contextmenu} {menuIndex} {itemIndex}>
	<svelte:fragment slot="button">
		{$space.name}
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={0}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceDelete',
					props: {space, done: () => dispatch('CloseDialog')},
				})}
		>
			Delete Space
		</ContextmenuItem>
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={1}
			on:click={() =>
				dispatch('ViewSpace', {
					space,
					view: {type: 'EntityExplorer'},
				})}
		>
			View with EntityExplorer
		</ContextmenuItem>
	</svelte:fragment>
</ContextmenuSubmenuItem>
