<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {ViewType, viewTypes as allViewTypes} from '$lib/vocab/space/space';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	// TODO instead of filtering here, this perhaps should be determined by metadata on space types
	const ViewTypes = allViewTypes.filter((s) => s !== ViewType.Home);

	let newName = '';
	let newType = ViewTypes[0];
	let nameEl: HTMLInputElement;
	let errorMessage: string | undefined;

	const create = async () => {
		if (!newName) {
			errorMessage = 'please enter a name for your new space';
			nameEl.focus();
			return;
		}
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		errorMessage = '';
		const url = `/${newName}`;
		const result = await dispatch('CreateSpace', {
			community_id: $community.community_id,
			name: newName,
			url,
			//TODO : add space type picker
			media_type: 'application/fuz+json',
			content: `{"type": "${newType}", "props": {"data": "/entities"}}`,
		});
		if (result.ok) {
			newName = '';
			newType = ViewTypes[0];
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<div class="markup">
	<h1>Create a new space</h1>
	<section>
		<!-- TODO likely make these a `select` or picker -->
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
		<Avatar name={$community.name} type="Community" />
	</section>
	<form>
		<div class:error={!!errorMessage}>{errorMessage || ''}</div>
		<input
			placeholder="> name"
			bind:value={newName}
			use:autofocus
			bind:this={nameEl}
			on:keydown={onKeydown}
		/>
		<label>
			Select Type:
			<select class="type-selector" bind:value={newType}>
				{#each ViewTypes as type (type)}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</label>
		<button type="button" on:click={create}> Create space </button>
	</form>
</div>

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	.type-selector {
		margin-left: var(--spacing_xs);
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
