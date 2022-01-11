<script lang="ts">
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInputItem from '$lib/ui/MembershipInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {personas},
	} = getApp();

	export let community: Readable<Community>;

	// TODO speed this up with a better cached data structures; the use of `get` is particularly bad
	$: invitableMembers = $community
		? $personas.filter(
				(x) => !$community.memberPersonas.some((y) => get(x).persona_id == y.persona_id),
		  )
		: [];
</script>

<div class="markup">
	<h1>Invite users to {$community.name}</h1>
	{#each invitableMembers as persona (persona)}
		<MembershipInputItem {persona} {community} />
	{:else}
		<p>There's no one new to invite</p>
	{/each}
</div>
