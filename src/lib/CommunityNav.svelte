<script lang="ts">
	import type {Community} from '../communities/community.js';
	import Modal from '$lib/Modal.svelte';

	export let communities: Community[];
	export let selectedCommunity: Community;
	export let selectCommunity: (community: Community) => void;

	let newName = '';

	const onKeyDown = async (e: KeyboardEvent, closeModal: () => void) => {
		if (e.key === 'Enter') {
			await createCommunity(newName);
			newName = '';
			closeModal();
		}
	};

	const createCommunity = async (name: string) => {
		if (!name) return;
		//Needs to collect name
		const doc = {
			name,
		};
		const res = await fetch(`/api/v1/communities`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(doc),
		});
		const data = await res.json();
		console.log(data);
		communities = communities.concat(data.community);
	};
</script>

<div class="sidenav">
	<div class="header">
		<Modal let:open={openModal} let:close={closeModal}>
			<span slot="trigger">
				<button
					aria-label="Create Community"
					type="button"
					class="button-emoji"
					on:click={() => openModal()}>➕</button
				>
			</span>
			<div slot="header">
				<h1>Create a new community</h1>
			</div>

			<div slot="content">
				<p>
					<input
						type="text"
						placeholder="> name"
						on:keydown={(e) => onKeyDown(e, closeModal)}
						bind:value={newName}
					/>
				</p>
			</div>
		</Modal>

		<!--TODO: Make an IconButton component in felt and use it here-->
		|
		<button
			aria-label="Search Spaces"
			type="button"
			class="button-emoji"
			on:click={() => console.log('search')}>🔍</button
		>
	</div>
	{#each communities as community (community.community_id)}
		<button type="button" class="button-nav" on:click={() => selectCommunity(community)}
			>{community.name}
		</button>
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
		border: 1px outset grey;
		background-color: lightGreen;
		height: 75px;
		width: 75px;
		cursor: pointer;
		margin: 5%;
		word-wrap: break-word;
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
