<script lang="ts">
	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
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
	<a href="/{community.name}{toUrl(space && space.url)}" style="--hue: {randomHue(community.name)}">
		<ActorIcon name={community.name} />
	</a>

	<!-- TODO copy the style of the  -->
	{space.name}
</div>

<style>
	.space-meta-nav {
		display: flex;
		align-items: center;
		height: var(--navbar_size);
		border-bottom: var(--border);
	}
</style>
