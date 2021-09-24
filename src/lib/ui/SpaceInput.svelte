<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {spaceTypes} from '$lib/vocab/space/space';

	const {api} = getApp();

	export let community: CommunityModel;

	let open = false;
	let newName = '';
	let newType = spaceTypes[0];
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
		const result = await api.createSpace({
			community_id: community.community_id,
			name: newName,
			url,
			//TODO : add space type picker
			media_type: 'application/fuz+json',
			content: `{"type": "${newType}", "props": {"data": "${url}/files"}}`,
		});
		if (result.ok) {
			newName = '';
			newType = spaceTypes[0];
			open = false;
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

<button aria-label="Create Space" type="button" class="button-emoji" on:click={() => (open = true)}>
	➕
</button>
{#if open}
	<Dialog on:close={() => (open = false)}>
		<div>
			<Markup>
				<h1>Create a new space</h1>
				<form>
					<div class:error={!!errorMessage}>{errorMessage || ''}</div>
					<input
						type="text"
						placeholder="> name"
						bind:value={newName}
						use:autofocus
						bind:this={nameEl}
						on:keydown={onKeydown}
					/>
					<label>
						Select Type:
						<select class="type-selector" bind:value={newType}>
							{#each spaceTypes as type (type)}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</label>
					<button type="button" on:click={create}> Create space </button>
				</form>
			</Markup>
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
</style>
