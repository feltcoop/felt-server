<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Entity} from '$lib/vocab/entity/entity';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let entity: Readable<Entity>;

	const {dispatch} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<span class="menu-item-entry"><UnicodeIcon icon="☉" /><span class="title">Entity</span></span>
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() => dispatch('OpenDialog', {Component: EntityEditor, props: {entity}})}
		>
			<span class="title">Edit Entity</span>
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
