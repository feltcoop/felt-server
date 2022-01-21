<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Post} from '$lib/vocab/entity/entityDataType';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {contextmenu, findPersonaById},
	} = getApp();

	export let entity: Readable<Entity>;
	$: data = $entity.data as Post;

	$: persona = findPersonaById($entity.actor_id);
</script>

<li
	use:contextmenu.action={{
		PersonaContextmenu: persona,
		EntityContextmenu: $entity.entity_id,
	}}
>
	<div class="markup formatted">
		{data.content}
	</div>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border);
		max-width: var(--column_width_min);
		margin: 10px;
		background-color: var(--input_bg_color);
	}
</style>
