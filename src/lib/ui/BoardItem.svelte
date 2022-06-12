<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';

	const {
		ui: {contextmenu, personaById, destTiesBySourceEntityId, entityById},
	} = getApp();

	export let entity: Readable<Entity>;
	export let space: Readable<Space>;
	export let selectedPost: Readable<Entity> | null;
	export let selectPost: (post: Readable<Entity>) => void;

	$: selected = selectedPost ? selectedPost === entity : false;

	$: destTies = $destTiesBySourceEntityId.value.get($entity.entity_id);

	$: items = $destTies?.value.reduce((acc, tie) => {
		if (tie.type === 'HasItem') {
			acc.push(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

	$: persona = personaById.get($entity.persona_id)!;

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($persona.name);

	$: hasItems = items !== undefined || $entity.data.type === 'Collection';

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
			{#if hasItems}
				<div class="icon-button">
					{#if selected}👉{:else}📝{/if}
				</div>
			{/if}
			<div class="text">
				{#if $entity.data.type === 'Collection'}
					{$entity.data.name}
				{:else}
					<EntityContent {entity} />
				{/if}
			</div>
			<div class="signature">
				<PersonaAvatar {persona} showName={false} />
			</div>
		</div>
		{#if items && selected}
			<div class="items panel-inset">
				<ul>
					{#each items as item (item)}
						<svelte:self entity={item} {space} {selectedPost} {selectPost} />
					{/each}
				</ul>
			</div>
		{/if}
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
		justify-content: space-between;
	}
	.entity {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.entity:hover {
		background-color: var(--tint_dark_1);
	}
	.entity form input {
		width: 50px;
		min-width: auto;
	}
	.items {
		width: 100%;
	}
	.markup {
		padding: 0 0 0 var(--spacing_md);
	}
	.icon-button {
		font-size: var(--font_size_xl);
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}
	.text {
		text-align: center;
		flex-grow: 2;
	}
</style>
