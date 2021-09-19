<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';

	export let file: File;
	export let persona: Persona; // TODO should this be `Actor`?

	// TODO shouldn't need this
	$: icon = (persona as any).icon || null;

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue(persona.name);
</script>

<li style="--hue: {hue}">
	<div class="content">
		{file.content}
	</div>
	<div class="about">
		<ActorIcon name={persona.name} {icon} />
		<span class="actor">{persona.name}</span>
	</div>
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
		flex-direction: column;
	}

	.actor {
		padding-left: var(--spacing_md);
		font-weight: var(--font_weight_4);
	}

	.content {
		font-size: var(--font_size_lg);
	}

	.about {
		display: flex;
		align-items: center;
	}
</style>
