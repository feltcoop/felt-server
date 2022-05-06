<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityTreeItem from '$lib/ui/EntityTreeItem.svelte';
	import type {Tie} from '$lib/vocab/tie/tie';

	// TODO this should possibly be a generic component instead of this named one

	export let entities: Readable<Array<Readable<Entity>>>;
	export let ties: Readable<Array<Readable<Tie>>>; // TODO maybe don't pass these and do lookups instead
</script>

<ul>
	{#each $entities as entity (entity)}
		<li>
			<EntityTreeItem {entity} {ties} />
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
	}
</style>
