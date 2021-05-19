<script lang="ts">
	import type {Space} from '../spaces/space.js';
	import Modal from '$lib/Modal.svelte';

	export let communityId: number;
	export let spaces: Space[];
	export let selectedSpace: Space;
	export let selectSpace: (community: Space) => void;

	const createSpace = async () => {
		//TODO: Trigger component with input form
		//Needs to collect url(i.e. name for now), type (currently default json/application), & content (hardcoded JSON struct)
		const url = '/hello/world';
		const text = {
			url: url,
			media_type: 'json/application',
			content: `{"type": "ChatRoom", "props": {"data": "${url}/posts"}}`,
		};
		const res = await fetch(`/api/v1/communities/${communityId}/spaces`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(text),
		});
		const data = await res.json();
		spaces.push(data.space);
	};
</script>

<Modal>
	<div slot="content">
		<p>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique, magni earum ut ex totam
			corporis unde incidunt deserunt, dolorem voluptatum libero quia. Maiores, provident error vel
			veritatis itaque nemo commodi.
		</p>
	</div>
</Modal>

<div class="sidenav">
	<div class="header">
		<button type="button" class="button-emoji" on:click={() => createSpace()}>➕</button>|
		<button type="button" class="button-emoji" on:click={() => console.log('search')}>🔍</button>
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

	button:active {
		background-color: grey;
	}

	.sidenav {
		width: 85px;
		height: 100%;
		position: fixed;
	}
</style>
