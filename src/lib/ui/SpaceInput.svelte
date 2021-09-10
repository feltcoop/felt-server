<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {get_app} from '$lib/ui/app';
	import {SpaceTypes} from '$lib/vocab/space/space';

	const {api} = get_app();

	export let community: CommunityModel;

	let open = false;
	let new_name = '';
	let new_type = Object.entries(SpaceTypes)[0][1];

	const create = async () => {
		if (!new_name || !new_type) return;
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		const url = `/${new_name}`;
		await api.create_space({
			community_id: community.community_id,
			name: new_name,
			url,
			//TODO : add space type picker
			media_type: 'application/fuz+json',
			content: `{"type": "${new_type}", "props": {"data": "${url}/files"}}`,
		});
		new_name = '';
		new_type = Object.entries(SpaceTypes)[0][1];
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
					<input type="text" placeholder="> name" bind:value={new_name} use:autofocus />
					<label class="type-label"
						>Select Type:
						<select class="type-selector" bind:value={new_type}>
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
