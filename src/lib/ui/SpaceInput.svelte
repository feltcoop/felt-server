<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let community: CommunityModel;

	let open = false;
	let new_name = '';

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create();
			open = false;
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
			`{"type": "Chat", "props": {"data": "${url}/files"}}`,
		);
		new_name = '';
	};
</script>

<button aria-label="Create Space" type="button" class="button-emoji" on:click={() => (open = true)}>
	➕
</button>
{#if open}
	<Modal close={() => (open = false)}>
		<div>
			<Markup>
				<h1>Create a new space</h1>
				<p>
					<input
						type="text"
						placeholder="> name"
						on:keydown={on_keydown}
						bind:value={new_name}
						use:autofocus
					/>
				</p>
			</Markup>
		</div>
	</Modal>
{/if}

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
