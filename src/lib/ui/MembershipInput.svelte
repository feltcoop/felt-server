<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInputItem from '$lib/ui/MembershipInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {personas},
	} = getApp();

	export let community: Readable<Community>;

	let opened = false;

	// TODO speed this up with a better cached data structures; the use of `get` is particularly bad
	$: invitableMembers = $community
		? $personas.filter(
				(x) => !$community.memberPersonas.some((y) => get(x).persona_id == y.persona_id),
		  )
		: [];
</script>

<!--TODO: Make an IconButton component in felt and use it here-->
<button
	aria-label="Invite users to {$community.name}"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	✉️
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
		<Markup>
			<h1>Invite users to {$community.name}</h1>
			{#each invitableMembers as persona (persona)}
				<MembershipInputItem {persona} {community} />
			{:else}
				<p>There's no one new to invite</p>
			{/each}
		</Markup>
	</Dialog>
{/if}

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
