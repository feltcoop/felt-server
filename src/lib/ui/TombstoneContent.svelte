<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {TombstoneEntityData} from '$lib/vocab/entity/entityData';

	export let entity: Readable<Entity>; // TODO support generic entity, `Entity<TombstoneEntityData>`

	$: formerType = ($entity.data as TombstoneEntityData).formerType || 'entity'; // TODO delete this typecast after finishing the above TODO
</script>

<span>🪦 <i>this {formerType} was erased</i></span>

<style>
	i {
		display: inline;
	}
</style>
