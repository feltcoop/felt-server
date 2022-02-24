<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {format} from 'date-fns';

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
	const selectedList = null;

	let pending = false;
	let source_id = '';

	$: ({checked = false} = $entity.data);

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($persona.name);

	$: updateEntity(checked); // eslint-disable-line @typescript-eslint/no-floating-promises

	$: console.log('TodoItem ties', ties);

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		console.log('pending start', pending);
		await dispatch('UpdateEntity', {
			entity_id: $entity.entity_id,
			data: {...$entity.data, checked},
		});
		pending = false;
		console.log('pending done', pending);
	};

	const renderEntity = (entity: Entity, ties: Tie[]): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		//2) If in default view only show Collections or untied Notes
		if (selectedList === null) {
			if (type === 'Collection') return true;
			for (const tie of ties) {
				if (tie.dest_id === entity.entity_id && tie.type === 'HasItem') return false;
			}
		}
		return true;
	};

	const addToCollection = async () => {
		const id = Number(source_id);
		if (!id) return;
		console.log(source_id);
		await dispatch('CreateTie', {
			source_id: id,
			dest_id: $entity.entity_id,
			type: 'HasItem',
		});
	};
</script>

<!-- TODO delete `PersonaContextmenu` ? should that be handled by the entity contextmenu?
And then PersonaContextmenu would be only for *session* personas? `SessionPersonaContextmenu` -->
{#if renderEntity($entity, ties)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			[PersonaContextmenu, {persona}],
			[EntityContextmenu, {entity}],
		]}
	>
		<div class="signature">
			{#if $entity.data.type === 'Collection'}
				📝
			{:else}
				<Avatar name={toName($persona)} icon={toIcon($persona)} showName={false} />
				<form>
					<input bind:value={source_id} /><button type="button" on:click={addToCollection}
						>Add to collection</button
					>
				</form>
			{/if}
		</div>
		<div class="markup formatted">
			<div class="signature">
				<Avatar name={toName($persona)} icon={toIcon($persona)} showIcon={false} />
				{#if $entity.updated}
					updated {format(new Date($entity.updated), 'Pp')}
				{:else}
					created {format(new Date($entity.created), 'Pp')}
				{/if}
			</div>
			<!-- TODO checkbox not updated properly on event broadcast-->
			<div>
				{#if $entity.data.type === 'Note'}
					<input type="checkbox" disabled={pending} bind:checked />
				{/if}
			</div>
			<div>
				{$entity.data.content}::{$entity.entity_id}
			</div>
		</div>
	</li>
{/if}

<style>
	li {
		align-items: flex-start;
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
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
