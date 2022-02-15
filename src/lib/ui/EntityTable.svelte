<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Entity} from '$lib/vocab/entity/entity';
	import EntityCell from '$lib/ui/EntityCell.svelte';

	// TODO clearly display when the thing has changed, and prominently show a save button
	// along with a "save all" button at the bottom (and for large forms, at the top too)

	export let entity: Readable<Entity>;

	$: properties = Object.keys($entity);
</script>

<table>
	<thead>
		{#each properties as propertyName (propertyName)}
			<td>{propertyName}</td>
		{/each}
	</thead>
	<tbody>
		<tr>
			{#each properties as propertyName (propertyName)}
				<td><EntityCell {entity} {propertyName} /></td>
			{/each}
		</tr>
	</tbody>
</table>

<style>
	thead {
		font-weight: 700;
	}
	thead td {
		padding-right: var(--spacing_lg);
	}
</style>
