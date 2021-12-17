<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import {randomHue} from '$lib/ui/color';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {findPersonaById},
	} = getApp();

	export let file: Readable<File>;

	$: persona = findPersonaById($file.actor_id); // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);
</script>

<li style="--hue: {hue}" data-entity="persona:{$persona.name},file:{$file.file_id}">
	<div class="markup">
		<p>
			{$file.content}
		</p>
	</div>
	<Avatar name={toName($persona)} icon={toIcon($persona)} />
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
		flex-direction: column;
	}
</style>
