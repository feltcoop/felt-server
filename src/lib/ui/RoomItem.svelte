<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {toIcon, toName} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {findPersonaById},
	} = getApp();

	export let file: Readable<File>;

	$: persona = findPersonaById($file.actor_id); // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);
</script>

<li style="--hue: {hue}">
	<div class="content">
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
		<div>
			{$file.content}
		</div>
	</div>
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
	}

	.content {
		padding-left: var(--spacing_sm);
	}
</style>
