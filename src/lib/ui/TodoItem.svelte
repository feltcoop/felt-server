<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {toIcon, toName} from '$lib/vocab/entity/entityHelpers';
	import {getApp} from '$lib/ui/app';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';

	const {
		ui: {contextmenu, personaById},
		dispatch,
	} = getApp();

	export let entity: Readable<Entity>;
	export let ties: Tie[];
	export let itemsByEntity: Map<Readable<Entity>, Array<Readable<Entity>>>;
	export let entityById: Map<number, Readable<Entity>>;
	export let selectedList: Entity | null;
	export let selectList: (list: Entity) => void;

	$: selected = selectedList ? selectedList === $entity : false;
	let pending = false;

	$: items = itemsByEntity.get(entity);

	$: ({checked} = $entity.data);

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);

	$: checked !== undefined && updateEntity(checked);

	$: hasItems = items !== undefined || $entity.data.type === 'Collection';
	$: hasChecked = checked !== undefined || $entity.data.type === 'Note';

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await dispatch.UpdateEntity({
			entity_id: $entity.entity_id,
			data: {...$entity.data, checked},
		});
		pending = false;
	};

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
		<div on:click={() => selectList($entity)} class="entity markup formatted">
			{#if hasItems}
				<div class="icon-button">
					{#if selected}👉{:else}📝{/if}
				</div>
			{/if}
			{#if hasChecked}
				<!-- TODO checkbox not updated properly on event broadcast-->
				<!-- TODO maybe use Felt checkbox component when available-->
				<input type="checkbox" disabled={pending} bind:checked />
			{/if}
			<div class="text">
				{#if $entity.data.type === 'Collection'}
					{$entity.data.name}
				{:else}
					{$entity.data.content}
				{/if}
			</div>
			<div class="signature">
				<Avatar name={toName($persona)} icon={toIcon($persona)} showName={false} />
			</div>
		</div>
		{#if items && selected}
			<div class="items panel-inset">
				<ul>
					{#each items as item (item)}
						<svelte:self
							entity={item}
							{ties}
							{itemsByEntity}
							{entityById}
							{selectedList}
							{selectList}
						/>
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
