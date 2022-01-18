<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {contextmenu, findPersonaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = findPersonaById($entity.actor_id);
</script>

<li
	use:contextmenu.action={{
		PersonaContextmenu: persona,
		EntityContextmenu: $entity.entity_id,
	}}
>
	<div class="markup">
		{$entity.content}
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

	.markup {
		/* force wrap long strings of text */
		overflow: hidden;
		/* remove this line when `break-spaces` is supported by Firefox Android:
		https://caniuse.com/mdn-css_properties_white-space_break-spaces */
		white-space: pre-wrap;
		white-space: break-spaces;
	}
</style>
