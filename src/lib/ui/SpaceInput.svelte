<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {SpaceTypes} from '$lib/vocab/space/space';

	const {api} = getApp();

	export let community: CommunityModel;

	let open = false;
	let newName = '';
	let newType = Object.entries(SpaceTypes)[0][1];

	const create = async () => {
		if (!newName || !newType) return;
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		const url = `/${newName}`;
		await api.createSpace({
			community_id: community.community_id,
			name: newName,
			url,
			//TODO : add space type picker
			media_type: 'application/fuz+json',
			content: `{"type": "${newType}", "props": {"data": "${url}/files"}}`,
		});
		newName = '';
		newType = Object.entries(SpaceTypes)[0][1];
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
					<input type="text" placeholder="> name" bind:value={newName} use:autofocus />
					<label class="type-label"
						>Select Type:
						<select class="type-selector" bind:value={newType}>
							{#each Object.entries(SpaceTypes) as type (type)}
								<option value={type[1]}>{type[0]}</option>
							{/each}
						</select>
					</label>
					<button on:click={create}> Create </button>
				</form>
			</Markup>
		</div>
	</Dialog>
{/if}

<style>
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
