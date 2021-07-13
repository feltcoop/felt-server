<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';
	import Modal from '$lib/ui/Modal.svelte';
	import type {Community} from '$lib/communities/community.js';

	export let community: Community;
	export let spaces: Space[];
	export let select_space: (community: Space) => void;

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await create_space();
			close_modal();
		}
	};

	const create_space = async () => {
		if (!new_name) return;
		//Needs to collect url(i.e. name for now), type (currently default json/application), & content (hardcoded JSON struct)
		const url = `/${new_name}`;
		const doc = {
			url,
			media_type: 'json/application',
			content: `{"type": "ChatRoom", "props": {"data": "${url}/posts"}}`,
		};
		const res = await fetch(`/api/v1/communities/${community.community_id}/spaces`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(doc),
		});
		const data = await res.json();
		spaces = spaces.concat(data.space);
		new_name = '';
	};
</script>

<div class="sidenav">
	<div class="header">
		<Modal let:open={open_modal} let:close={close_modal}>
			<span slot="trigger">
				<button
					aria-label="Create Space"
					type="button"
					class="button-emoji"
					on:click={() => open_modal()}>➕</button
				>
			</span>
			<div slot="header">
				<h1>Create a new space</h1>
			</div>

			<div slot="content">
				<p>
					<input
						type="text"
						placeholder="> chat"
						on:keydown={(e) => on_keydown(e, close_modal)}
						bind:value={new_name}
					/>
				</p>
			</div>
		</Modal>
	</div>
	{#each spaces as space (space.space_id)}
		<button type="button" class="button-nav" on:click={() => select_space(space)}
			>{space.url}</button
		>
	{/each}
</div>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}

	.button-nav {
		background: none;
		border: none;
		font-weight: bold;
	}

	.button-nav:hover {
		background-color: lightGreen;
	}

	.button-nav:active {
		background-color: grey;
	}

	button:active {
		background-color: grey;
	}

	.sidenav {
		width: 85px;
		height: 100%;
		position: fixed;
	}
</style>
