<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import TodoItem from '$lib/ui/TodoItem.svelte';
	import type {Space} from '$lib/vocab/space/space';

	export let entities: Readable<Array<Readable<Entity>>>;
	export let space: Readable<Space>;
	//TODO properly wrap in reactive store
	export let ties: Tie[];
	export let itemsByEntity: Map<Readable<Entity>, Array<Readable<Entity>>>;
	export let entityById: Map<number, Readable<Entity>>;
	export let selectedList: Entity | null;
	export let selectList: (list: Entity) => void;

	//TODO in directory structure, this would just grab the "lists" collection from the dir
	$: collectionEntities = $entities?.filter((e) => e.get().data.type === 'Collection');
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each collectionEntities as entity (entity)}
		<TodoItem {entity} {space} {ties} {itemsByEntity} {entityById} {selectedList} {selectList} />
	{/each}
</ul>
