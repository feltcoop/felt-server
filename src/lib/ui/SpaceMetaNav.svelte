<script lang="ts">
	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {toUrl} from '$lib/vocab/persona/constants';
	import {randomHue} from '$lib/ui/color';

	/* 
  
  TODO design
  
  - maybe show only icons for the persona+community?

  */

	export let community: Community;
	export let space: Space;
</script>

<div class="space-meta-nav">
	<!-- TODO extract helper -->
	<a
		class="avatars"
		href="/{community.name}{toUrl(space && space.url)}"
		style="--hue: {randomHue(community.name)}"
	>
		<Avatar name={community.name} showName={false} />
		<Avatar name={space.name} showIcon={false} />
	</a>
</div>

<style>
	.space-meta-nav {
		display: flex;
		height: var(--navbar_size);
		border-bottom: var(--border);
	}
	.avatars {
		display: flex;
		align-items: center;
		height: 100%;
	}
</style>
