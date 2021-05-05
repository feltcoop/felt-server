<script lang="ts">
	import CommunityNav from '$lib/CommunityNav.svelte';
	import SpaceNav from '$lib/SpaceNav.svelte';
	import type {Community} from 'src/communities/community.js';

	export let communities: Community[];
	let selectedCommunity = communities[0];
	const selectCommunity = (community: Community) => {
		selectedCommunity = community;
	};
</script>

<div class="workspace">
	<section class="communitynav">
		<CommunityNav {communities} {selectedCommunity} {selectCommunity} />
	</section>
	<section class="spacenav"><SpaceNav spaces={selectedCommunity.spaces} /></section>
	<div class="viewfinder">"hello this is where a chat box would go"</div>
</div>

<style>
	.workspace {
		height: 100%;
		display: flex;
	}

	section {
		height: 100%;
		flex: 1;
		border: 1px solid #ccc;
	}

	.viewfinder {
		height: 100%;
		border: 1px solid #ccc;
		width: 80%;
	}
</style>
