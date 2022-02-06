<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import type {Readable} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import EntityItems from '$lib/ui/EntityItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch, socket} = getApp();

	export const persona: Readable<Persona> = undefined as any;
	export const community: Readable<Community> = undefined as any;
	export let space: Readable<Space>;

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch('QueryEntities', {space_id: $space.space_id}) : null;
</script>

<div class="entity-explorer">
	<button type="button" on:click={() => dispatch('ViewSpace', {space, view: null})}>
		Close EntityExplorer
	</button>
	<div class="entities">
		{#if entities}
			<EntityItems {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.entity-explorer {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
