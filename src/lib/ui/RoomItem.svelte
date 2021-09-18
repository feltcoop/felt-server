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
	<ActorIcon name={persona.name} {icon} />
	<div class="content">
		<div>
			<span class="actor">{persona.name}</span>
		</div>
		<div>
			{file.content}
		</div>
	</div>
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
	}

	.actor {
		font-weight: var(--font_weight_4);
	}

	.content {
		padding-left: var(--spacing_sm);
	}
</style>
