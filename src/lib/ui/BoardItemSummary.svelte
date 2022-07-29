<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let entity: Readable<Entity>;
	export let selectPost: (post: Readable<Entity>) => void;

	$: persona = personaById.get($entity.persona_id)!;

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($persona.name);

	//TODO is this still needed?
	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		return true;
	};
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
{#if renderEntity($entity)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			[PersonaContextmenu, {persona}],
			[EntityContextmenu, {entity}],
		]}
	>
		<div on:click={() => selectPost(entity)} class="entity markup formatted">
			<div>
				{#if $entity.data.name}
					{$entity.data.name}
				{:else}
					<em>no name found</em>
				{/if}
			</div>
			<div class="signature">
				<PersonaAvatar {persona} />
			</div>
		</div>
	</li>
{/if}

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
	}
	.signature {
		display: flex;
		align-items: center;
		--icon_size: var(--icon_size_xs);
	}
	.entity {
		display: flex;
	}
	.entity:hover {
		background-color: var(--tint_dark_1);
	}
	.markup {
		/* the bottom padding prevents chars like y and g from being cut off */
		padding: 0 0 var(--spacing_xs) var(--spacing_md);
	}
</style>
