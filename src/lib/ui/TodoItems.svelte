<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import TodoItem from '$lib/ui/TodoItem.svelte';
	import type {Space} from '$lib/vocab/space/space';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity>) => void;

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each collectionEntities as entity (entity)}
		<TodoItem {entity} {space} {selectedList} {selectList} />
	{/each}
</ul>
