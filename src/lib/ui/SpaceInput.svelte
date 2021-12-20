<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
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

	// TODO instead of filtering here, this perhaps should be determined by metadata on space types
	const ViewTypes = allViewTypes.filter((s) => s !== ViewType.Home);

	let opened = false;
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
			opened = false;
		} else {
			errorMessage = result.reason;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<button
	aria-label="Create Space"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	➕
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
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
	</Dialog>
{/if}

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
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
