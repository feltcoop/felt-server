<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import SpaceNavItem from '$lib/ui/SpaceNavItem.svelte';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {getApp} from '$lib/ui/app';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let spaces: Array<Readable<Space>>;
	export let selectedSpace: Readable<Space> | null;
</script>

<nav class="space-nav" use:contextmenu.action={[[CommunityContextmenu, {community, persona}]]}>
	{#each spaces as space (space)}
		<SpaceNavItem {persona} {community} {space} selected={space === selectedSpace} />
	{/each}
</nav>

<style>
	.space-nav {
		--icon_size: var(--icon_size_sm);
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
</style>
