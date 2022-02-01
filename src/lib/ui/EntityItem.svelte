<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = personaById.get($entity.actor_id)!;
</script>

<li
	use:contextmenu.action={[
		[PersonaContextmenu, {persona}],
		[EntityContextmenu, {entity}],
	]}
>
	<pre>{JSON.stringify($entity, null, 2)}</pre>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg_color);
		overflow: auto;
	}
</style>
