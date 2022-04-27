<script lang="ts">
	import type {Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import SpaceDelete from '$lib/ui/SpaceDelete.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import SpaceEditor from '$lib/ui/SpaceEditor.svelte';
	import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
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
				dispatch.OpenDialog({
					Component: SpaceEditor,
					props: {space, community},
					dialogProps: {layout: 'page'},
				})}
		>
			<span class="title"> Edit Space </span>
		</ContextmenuEntry>
		{#if canDeleteSpace($space)}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: SpaceDelete,
						props: {persona, community, space, done: () => dispatch.CloseDialog()},
					})}
			>
				<span class="title"> Delete Space </span>
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
			action={() =>
				dispatch.ViewSpace({
					space,
					view: '<EntityExplorer />',
				})}
		>
			<span class="title">View with EntityExplorer</span>
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
