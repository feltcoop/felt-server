<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let entity: Readable<Entity>;

	const {dispatch} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="☉" />
	</svelte:fragment>
	Entity
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: EntityEditor,
					props: {entity, done: () => dispatch.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Edit Entity
		</ContextmenuEntry>
		<!-- TODO add confirmation dialogs to both delete and erase actions -->
		{#if $entity.data.type !== 'Tombstone'}
			<ContextmenuEntry action={() => dispatch.EraseEntities({entityIds: [$entity.entity_id]})}>
				Erase Entity
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry action={() => dispatch.DeleteEntities({entityIds: [$entity.entity_id]})}>
			Delete Entity
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
