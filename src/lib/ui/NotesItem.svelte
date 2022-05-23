<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = personaById.get($entity.persona_id)!;
</script>

<li
	use:contextmenu.action={[
		[PersonaContextmenu, {persona}],
		[EntityContextmenu, {entity}],
	]}
>
	<div class="markup formatted">
		<EntityContent {entity} />
	</div>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border);
		max-width: var(--column_width_sm);
		margin: 10px;
		background-color: var(--input_bg_color);
	}
</style>
