<script lang="ts">
	import type {Space} from '../spaces/space.js';
	import Modal from '$lib/Modal.svelte';

	import type {Community} from '../communities/community.js';

	export let community: Community;
	export let spaces: Space[];
	export let selectedSpace: Space;
	export let selectSpace: (community: Space) => void;

	let newName = '';

	const onKeyDown = async (e: KeyboardEvent, closeModal: () => void) => {
		if (e.key === 'Enter') {
			await createSpace();
			closeModal();
		}
	};

	const createSpace = async () => {
		if (!newName) return;
		//Needs to collect url(i.e. name for now), type (currently default json/application), & content (hardcoded JSON struct)
		const url = `/${newName}`;
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
		newName = '';
	};
</script>

<div class="sidenav">
	<div class="header">
		<Modal let:open={openModal} let:close={closeModal}>
			<span slot="trigger">
				<button
					aria-label="Create Space"
					type="button"
					class="button-emoji"
					on:click={() => openModal()}>➕</button
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
						on:keydown={(e) => onKeyDown(e, closeModal)}
						bind:value={newName}
					/>
				</p>
			</div>
		</Modal>
	</div>
	{#each spaces as space (space.space_id)}
		<button type="button" class="button-nav" on:click={() => selectSpace(space)}>{space.url}</button
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
