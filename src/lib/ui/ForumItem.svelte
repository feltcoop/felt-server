<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {randomHue} from '$lib/ui/color';
	import PersonaInfo from '$lib/ui/PersonaInfo.svelte';

	export let file: File;
	export let persona: Persona; // TODO should this be `Actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue(persona.name);
</script>

<li style="--hue: {hue}">
	<div class="content">
		{file.content}
	</div>
	<PersonaInfo {persona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
		flex-direction: column;
	}
	.content {
		font-size: var(--font_size_lg);
	}
</style>
