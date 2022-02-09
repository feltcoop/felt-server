<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import TaskItem from '$lib/ui/TaskItem.svelte';

	export let entities: Readable<Readable<Entity>[]>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<TaskItem {entity} />
	{/each}
</ul>
