<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import BoardItemSummary from '$lib/ui/BoardItemSummary.svelte';
	import BoardItemDetail from '$lib/ui/BoardItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let persona: Readable<Persona>;
	export let selectedPost: Readable<Entity> | null;
	export let selectPost: (post: Readable<Entity>) => void;

	const goBack = () => {
		selectPost(selectedPost!);
	};

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->

{#if selectedPost}
	<button on:click={goBack}>Go Back</button>
	<div class="wrapper">
		<BoardItemDetail entity={selectedPost} {space} {persona} />
	</div>
{:else}
	<ul>
		{#each collectionEntities as entity (entity)}
			<BoardItemSummary {entity} {selectPost} />
		{/each}
	</ul>
{/if}

<style>
	.wrapper {
		padding: var(--spacing_md);
	}
</style>
