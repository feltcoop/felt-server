<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
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
		{#if $entity.data.type === 'Tombstone'}<TombstoneContent {entity} />{:else}{$entity.data
				.content}{/if}
	</div>
	<PersonaAvatar {persona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
		flex-direction: column;
	}

	.markup {
		font-size: var(--font_size_lg);
		padding: 0 0 0 var(--spacing_md);
	}
</style>
