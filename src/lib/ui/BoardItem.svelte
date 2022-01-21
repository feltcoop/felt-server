<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {randomHue} from '$lib/ui/color';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {contextmenu, findPersonaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = findPersonaById($entity.actor_id); // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);
</script>

<li
	style="--hue: {hue}"
	use:contextmenu.action={{
		PersonaContextmenu: {persona},
		EntityContextmenu: {entity},
	}}
>
	<div class="markup formatted">
		<p>
			{$entity.data.content}
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
	.markup {
		padding: var(--spacing_sm);
	}
</style>
