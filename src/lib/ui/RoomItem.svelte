<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
<li
	style="--hue: {hue}"
	use:contextmenu.action={[
		[PersonaContextmenu, {persona}],
		[EntityContextmenu, {entity}],
	]}
>
	<div class="signature">
		<PersonaAvatar {persona} showName={false} />
	</div>
	<div class="markup formatted">
		<div class="signature">
			<PersonaAvatar {persona} showIcon={false} />
			{format($entity.created, 'Pp')}
		</div>
		<div>
			<EntityContent {entity} />
		</div>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--tint_lightness_8)));
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.markup {
		padding: 0 0 0 var(--spacing_md);
	}
</style>
