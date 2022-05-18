<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityCell from '$lib/ui/EntityCell.svelte';

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
