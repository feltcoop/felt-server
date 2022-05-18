<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import NotesItem from '$lib/ui/NotesItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let entities: Readable<Array<Readable<Entity>>>;

	$: notes = $entities.slice().reverse(); // TODO definitely not this
</script>

<ul>
	{#each notes as entity (entity)}
		<NotesItem {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
