<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ForumMessageItem from '$lib/ui/ForumMessageItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let entities: Entity[];
	export let selectedThread: Readable<Entity> | null;
	export let selectThread: (thread: Readable<Entity>) => void;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each entities as entity (entity)}
		<ForumMessageItem {entity} {selectedThread} {selectThread} />
	{/each}
</ul>
