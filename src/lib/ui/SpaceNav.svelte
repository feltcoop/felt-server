<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Readable} from 'svelte/store';
	import SpaceNavItem from '$lib/ui/SpaceNavItem.svelte';
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

<div class="space-nav" use:contextmenu.action={{CommunityContextmenu: {community, persona}}}>
	{#each spaces as space (space)}
		<SpaceNavItem {persona} {community} {space} selected={space === selectedSpace} />
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
