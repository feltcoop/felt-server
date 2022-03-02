<script lang="ts">
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import {type Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';

	export let entity: Readable<Entity>;

	const {
		dispatch,
		devmode,
		ui: {personaById},
	} = getApp();

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	// TODO granular data properties like `content`
	// how? should there be a keypath that's null?
	const updateEntityData = async (updated: any, field: string, $value: Entity) =>
		dispatch('UpdateEntity', {
			entity_id: $value.entity_id,
			[field]: updated,
		} as any); // TODO typecast
</script>

<div class="markup column">
	<h2>Edit Entity</h2>
	<h3>creator</h3>
	<section style:--icon_size="var(--icon_size_sm)">
		<p><Avatar name={toName($persona)} icon={toIcon($persona)} /></p>
		<p>created {format(new Date($entity.created), 'PPPPp')}</p>
		{#if $entity.updated !== null}
			<p>updated {format(new Date($entity.updated), 'PPPPp')}</p>
		{/if}
	</section>
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<PropertyEditor
			value={entity}
			field="data"
			update={updateEntityData}
			parse={parseJson}
			serialize={serializeJson}
		/>
	</form>
	{#if $devmode}
		<hr />
		<section>
			<EntityTable {entity} />
		</section>
	{/if}
</div>

<style>
	h2 {
		text-align: center;
	}
</style>
