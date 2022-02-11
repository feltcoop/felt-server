<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInputItem from '$lib/ui/MembershipInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {personas, personasByCommunityId},
	} = getApp();

	export let community: Readable<Community>;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;

	// TODO speed this up with a better cached data structures
	$: invitableMembers = $community
		? $personas.value.filter((p) => !communityPersonas.includes(p))
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
