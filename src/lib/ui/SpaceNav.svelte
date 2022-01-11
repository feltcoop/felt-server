<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Readable} from 'svelte/store';
	import SpaceNavItem from '$lib/ui/SpaceNavItem.svelte';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceDelete from '$lib/ui/SpaceDelete.svelte';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {contextmenu},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let spaces: Readable<Space>[];
	export let selectedSpace: Readable<Space>;
</script>

<nav class="space-nav" use:contextmenu.action={{CommunityContextmenu: {community, persona}}}>
	<div class="header">
		<SpaceInput {persona} {community} />
		<SpaceDelete space={selectedSpace} />
		{#if $community.name !== $persona.name}
			<MembershipInput {community} />
		{/if}
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space)}
		<SpaceNavItem {persona} {community} {space} selected={space === selectedSpace} />
	{/each}
</nav>

<style>
	.space-nav {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
</style>
