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

<div class="marquee-nav">
	<!-- TODO url extract helper -->
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
	.marquee-nav {
		position: relative;
		display: flex;
		justify-content: space-between;
		height: var(--navbar_size);
		border-bottom: var(--border);
		padding-right: var(--navbar_size); /* placeholder for button, which is rendered elsewhere */
	}
	.avatars {
		display: flex;
		align-items: center;
		height: 100%;
	}
</style>
