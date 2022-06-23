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
		dispatch,
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

	let openReply = false;
	let text = '';

	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		return true;
	};
	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !selectedPost) return;

		//TODO better error handling
		await dispatch.CreateEntity({
			data: {type: 'Note', content},
			persona_id: $persona.persona_id,
			source_id: $entity.entity_id,
		});
		await dispatch.UpdateEntity({
			data: null,
			entity_id: $space.directory_id,
		});
		text = '';
		openReply = false;
	};
	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createEntity();
		}
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
			{#if $entity.data.name}
				<div class="icon-button">
					{#if selected}👉{:else}📝{/if}
				</div>
			{/if}
			<div class="text">
				{#if $entity.data.type === 'Collection'}
					{$entity.data.name}
					{#if selected}
						<br /><EntityContent {entity} />
					{/if}
				{:else}
					<EntityContent {entity} />
					<br /><a on:click={() => (openReply = !openReply)}>reply</a>
					{#if openReply}
						<input placeholder="> replying to comment" on:keydown={onKeydown} bind:value={text} />
					{/if}
				{/if}
			</div>
			<div class="signature">
				<PersonaAvatar {persona} showName={false} />
			</div>
		</div>
		{#if items && selectedPost}
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
