<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import RoomItem from '$lib/ui/RoomItem.svelte';

	export let entities: Readable<Array<Readable<Entity>>>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $entities as entity (entity)}
		<RoomItem {entity} />
	{/each}
</ul>
