<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {findPersonaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = findPersonaById($entity.actor_id);
</script>

<li data-entity="persona:{$persona.name},entity:{$entity.entity_id}">
	{$entity.content}
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border);
		max-width: var(--column_width_min);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg_color);
	}
</style>
