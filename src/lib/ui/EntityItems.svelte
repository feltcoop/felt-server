<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityItem from '$lib/ui/EntityItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<ul>
	{#each $entities as entity (entity)}
		<EntityItem {entity} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
	}
</style>
