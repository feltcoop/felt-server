<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import BoardItem from '$lib/ui/BoardItem.svelte';
	import type {Space} from '$lib/vocab/space/space';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let selectedPost: Readable<Entity> | null;
	export let selectPost: (post: Readable<Entity>) => void;

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#if selectedPost}
		<BoardItem entity={selectedPost} {space} {selectedPost} {selectPost} />
	{:else}
		{#each collectionEntities as entity (entity)}
			<BoardItem {entity} {space} {selectedPost} {selectPost} />
		{/each}
	{/if}
</ul>
