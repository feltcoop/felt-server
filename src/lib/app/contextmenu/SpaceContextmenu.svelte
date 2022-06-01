<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

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
	<svelte:fragment slot="icon">
		<SpaceIcon {space} />
	</svelte:fragment>
	{$space.name}
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: SpaceEditor,
					props: {space, community},
					dialogProps: {layout: 'page'},
				})}
		>
			Edit Space
		</ContextmenuEntry>
		{#if canDeleteSpace($space)}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: SpaceDelete,
						props: {persona, community, space, done: () => dispatch.CloseDialog()},
					})}
			>
				Delete Space
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
			action={() =>
				dispatch.ViewSpace({
					space_id: $space.space_id,
					view: '<EntityExplorer />',
				})}
		>
			View with EntityExplorer
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
