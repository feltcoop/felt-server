<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Entity} from '$lib/vocab/entity/entity';

	// TODO clearly display when the thing has changed, and prominently show a save button
	// along with a "save all" button at the bottom (and for large forms, at the top too)

	export let entity: Readable<Entity>;
	export let propertyName: string;

	$: value = ($entity as any)[propertyName];

	$: rawData = propertyName === 'data' ? JSON.stringify($entity.data) : undefined; // TODO
	let newData = rawData;
	console.log(`newData`, newData);
</script>

{#if propertyName.endsWith('_id')}
	{value}
{:else if propertyName === 'data'}<textarea bind:value={newData} />{:else}
	{value}
{/if}
