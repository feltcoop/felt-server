<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

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
