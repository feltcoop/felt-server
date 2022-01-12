<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	$: space = $contextmenu.items.SpaceContextmenu;
</script>

<div class="markup">
	<p>
		{$space.name}
	</p>
</div>
<ContextmenuItem
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'SpaceDelete',
			props: {space, done: () => dispatch('CloseDialog')},
		})}
>
	Delete Space
</ContextmenuItem>
