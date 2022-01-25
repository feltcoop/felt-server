<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {toIcon, toName} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {contextmenu, findPersonaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = findPersonaById($entity.actor_id); // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={{
		PersonaContextmenu: {persona},
		EntityContextmenu: {entity},
	}}
>
	<div class="timestamp">
		<Avatar name={toName($persona)} icon={toIcon($persona)} showName={false} />
	</div>
	<div class="markup formatted">
		<div class="timestamp">
			<Avatar name={toName($persona)} icon={toIcon($persona)} showIcon={false} />
			{$entity.created}
		</div>
		<div>
			{$entity.data.content}
		</div>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
	}
	.timestamp {
		display: flex;
		align-items: center;
	}
	.markup {
		padding: 0 0 0 var(--spacing_md);
	}
</style>
