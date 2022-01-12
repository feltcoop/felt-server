<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';
	import ContextsubmenuItem from '$lib/ui/contextmenu/ContextsubmenuItem.svelte';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	$: space = $contextmenu.items.SpaceContextmenu;
</script>

<ContextsubmenuItem>
	<svelte:fragment slot="button">
		{$space.name}
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuItem
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceDelete',
					props: {space, done: () => dispatch('CloseDialog')},
				})}
		>
			Delete Space
		</ContextmenuItem>
	</svelte:fragment>
</ContextsubmenuItem>
