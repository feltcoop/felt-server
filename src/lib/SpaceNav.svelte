<script lang="ts">
	import type {Space} from '../spaces/space.js';
	import type {Community} from '../communities/community.js';

	export let community: Community;
	export let spaces: Space[];
	export let selectedSpace: Space;
	export let selectSpace: (community: Space) => void;

	const createSpace = async () => {
		//TODO: Trigger component with input form
		//Needs to collect url(i.e. name for now), type (currently default json/application), & content (hardcoded JSON struct)
		const url = '/hello/world';
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
	};
</script>

<div class="sidenav">
	<div class="header">
		<!--TODO: Make an IconButton component in felt and use it here-->
		<button
			aria-label="Create Space"
			type="button"
			class="button-emoji"
			on:click={() => createSpace()}>➕</button
		>|
		<button
			aria-label="Search Spaces"
			type="button"
			class="button-emoji"
			on:click={() => console.log('search')}>🔍</button
		>
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
