<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInputItem from '$lib/ui/MembershipInputItem.svelte';
	import {getApp} from '$lib/ui/app';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';

	const {
		ui: {personas, personaSelection, personasByCommunityId},
	} = getApp();

	export let community: Readable<Community>;

	$: selectedPersona = $personaSelection;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;

	// TODO speed this up with a better cached data structures
	$: invitableMembers = $community
		? $personas.value.filter((p) => !communityPersonas.includes(p))
		: [];
</script>

<div class="markup">
	<h1>Invite Members</h1>
	<section class="row">
		<span class="spaced">to</span>
		<CommunityAvatar {community} />
	</section>
	<section class="row">
		{#if selectedPersona}
			<span class="spaced">as</span> <PersonaAvatar persona={selectedPersona} />
		{:else}
			<div>(no persona selected)</div>
		{/if}
	</section>
	{#each invitableMembers as persona (persona)}
		<MembershipInputItem {persona} {community} />
	{:else}
		<p>There's no one new to invite</p>
	{/each}
</div>
