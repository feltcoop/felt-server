<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';
	import Modal from '$lib/ui/Modal.svelte';
	import type {Community_Model} from '$lib/communities/community.js';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let community: Community_Model;
	export let spaces: Space[];
	export let selected_space: Space;

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await create();
			close_modal();
		}
	};

	const create = async () => {
		if (!new_name) return;
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		const url = `/${new_name}`;
		await api.create_space(
			community.community_id,
			new_name,
			url,
			'application/json',
			`{"type": "Chat_Room", "props": {"data": "${url}/posts"}}`,
		);
		new_name = '';
	};
</script>

<div class="space-nav">
	<div class="header">
		<Modal>
			<div slot="trigger" let:open>
				<button
					aria-label="Create Space"
					type="button"
					class="button-emoji"
					on:click={() => open()}
				>
					➕
				</button>
			</div>
			<div slot="content" let:close>
				<h1>Create a new space</h1>
				<p>
					<input
						type="text"
						placeholder="> name"
						on:keydown={(e) => on_keydown(e, close)}
						bind:value={new_name}
					/>
				</p>
			</div>
		</Modal>
	</div>
	{#each spaces as space (space.space_id)}
		<button
			class:selected={space === selected_space}
			disabled={space === selected_space}
			on:click={() => api.select_space(community.community_id, space.space_id)}
		>
			{space.url}
		</button>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		border-top: var(--border);
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}

	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
