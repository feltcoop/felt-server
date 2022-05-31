<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import TombstoneContent from './TombstoneContent.svelte';

	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;

	const {
		dispatch,
		devmode,
		ui: {personaById},
	} = getApp();

	$: persona = personaById.get($entity.persona_id)!;

	const updateEntityDataProperty = async (updated: any, field: string) =>
		dispatch.UpdateEntity({
			entity_id: $entity.entity_id,
			data: {...$entity.data, [field]: updated},
		});

	const updateEntityData = async (updated: any) =>
		dispatch.UpdateEntity({
			entity_id: $entity.entity_id,
			data: updated,
		});

	// TODO factor this out into a component or something, and handle failures
	let deletePending = false;
	const deleteEntity = async () => {
		deletePending = true;
		await dispatch.DeleteEntities({entity_ids: [$entity.entity_id]});
		deletePending = false;
		done?.();
	};
</script>

<div class="entity-editor column">
	<div class="markup padded-xl">
		<h1>Edit Entity</h1>
		<section class="row">
			<span class="spaced">created by</span>
			<PersonaAvatar {persona} />
		</section>
		<section style:--icon_size="var(--icon_size_sm)">
			<p>created {format($entity.created, 'PPPPp')}</p>
			{#if $entity.updated !== null}
				<p>updated {format($entity.updated, 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<ul>
			{#if $entity.data.type === 'Tombstone'}
				<div><TombstoneContent {entity} /></div>
				<PendingButton on:click={() => deleteEntity()} pending={deletePending}
					>Delete entity</PendingButton
				>
			{:else}
				<li>
					<!-- TODO how to make this use `EntityContent`? slot? could default to the `pre` -->
					<PropertyEditor
						value={$entity.data.content}
						field="content"
						update={updateEntityDataProperty}
					/>
				</li>
				{#if $devmode}
					<li>
						<PropertyEditor
							value={$entity.data}
							field="data"
							update={updateEntityData}
							parse={parseJson}
							serialize={serializeJson}
						/>
					</li>
				{/if}
			{/if}
		</ul>
	</form>
	{#if $devmode}
		<hr />
		<section>
			<EntityTable {entity} />
		</section>
	{/if}
</div>

<style>
	.entity-editor {
		padding: var(--spacing_xl);
	}
	h1 {
		text-align: center;
	}
	form li {
		flex-direction: column;
		padding: var(--spacing_xl) 0;
	}
</style>
