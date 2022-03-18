<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import {getApp} from '$lib/ui/app';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';

	export let entity: Readable<Entity>;

	const {
		dispatch,
		devmode,
		ui: {personaById},
	} = getApp();

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

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
</script>

<div class="entity-editor column">
	<div class="markup">
		<h1>Edit Entity</h1>
		<section class="row">
			<span class="spaced">created by</span>
			<PersonaAvatar {persona} />
		</section>
		<section style:--icon_size="var(--icon_size_sm)">
			<p>created {format(new Date($entity.created), 'PPPPp')}</p>
			{#if $entity.updated !== null}
				<p>updated {format(new Date($entity.updated), 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<ul>
			<li>
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
