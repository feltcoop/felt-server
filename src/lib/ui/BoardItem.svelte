<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {randomHue} from '$lib/ui/color';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = personaById.get($entity.persona_id)!;

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($persona.name);
</script>

<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[PersonaContextmenu, {persona}],
		[EntityContextmenu, {entity}],
	]}
>
	<div class="markup formatted">
		<EntityContent {entity} />
	</div>
	<PersonaAvatar {persona} />
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
		flex-direction: column;
	}
	.markup {
		padding: var(--spacing_sm);
	}
</style>
