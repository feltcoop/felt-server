<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {Community_Model} from '$lib/communities/community.js';
	import {get_api} from '$lib/ui/api';
	import {autofocus} from '$lib/ui/actions';

	const api = get_api();

	export let community: Community_Model;

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
			//TODO : add space type picker
			'application/fuz+json',
			`{"type": "Chat", "props": {"data": "${url}/posts"}}`,
		);
		new_name = '';
	};
</script>

<Modal>
	<div slot="trigger" let:open>
		<button aria-label="Create Space" type="button" class="button-emoji" on:click={() => open()}>
			<slot>➕</slot>
		</button>
	</div>
	<div slot="content" let:close>
		<Markup>
			<h1>Create a new space</h1>
			<p>
				<input
					type="text"
					placeholder="> name"
					on:keydown={(e) => on_keydown(e, close)}
					bind:value={new_name}
					use:autofocus
				/>
			</p>
		</Markup>
	</div>
</Modal>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
