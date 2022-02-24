<script lang="ts">
	import {type Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import TodoItem from '$lib/ui/TodoItem.svelte';

	export let entities: Readable<Array<Readable<Entity>>>;
	//TODO properly wrap in reactive store
	export let ties: Tie[];
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<TodoItem {entity} {ties} />
	{/each}
</ul>
