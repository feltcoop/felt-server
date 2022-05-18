<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import BoardItem from '$lib/ui/BoardItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<BoardItem {entity} />
	{/each}
</ul>

<style>
	ul {
		flex-direction: column-reverse;
	}
</style>
