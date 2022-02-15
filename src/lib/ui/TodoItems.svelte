<script lang="ts">
	import {get, type Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import TodoItem from '$lib/ui/TodoItem.svelte';
	import CollectionItem from '$lib/ui/CollectionItem.svelte';

	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		{#if get(entity).data.type === 'Note'}
			<TodoItem {entity} />
		{:else if get(entity).data.type === 'Collection'}
			<CollectionItem {entity} />
		{/if}
	{/each}
</ul>
