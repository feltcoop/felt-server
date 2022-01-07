<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Readable} from 'svelte/store';
	import SpaceNavItem from '$lib/ui/SpaceNavItem.svelte';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let spaces: Space[]; // TODO array of stores?
	export let selectedSpace: Readable<Space>;
</script>

<div class="space-nav" data-entity="community:{$community.name}">
	<div class="header">
		<button
			aria-label="Create Space"
			type="button"
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceInput',
					props: {persona, community, done: () => dispatch('CloseDialog')},
				})}
		>
			➕
		</button>
		<button
			aria-label="Invite users to {$community.name}"
			type="button"
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'MembershipInput',
					props: {community},
				})}
		>
			✉️
		</button>
		<button
			aria-label="Delete Space"
			type="button"
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceDelete',
					props: {space: selectedSpace, done: () => dispatch('CloseDialog')},
				})}
		>
			🗑️
		</button>
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<SpaceNavItem {persona} {community} {space} selected={space === $selectedSpace} />
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}
</style>
