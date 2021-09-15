<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import {getApp} from '$lib/ui/app';

	const {data} = getApp();

	export let space: Space;
	export let membersById: Map<number, Member>;

	space;

	// TODO this is hacky because of the member data, fix when `memberships` are fixed
	// TODO cache data better to speed this up!!
	console.log('$data.personas', $data.personas);
	$: personas = Array.from(membersById.values()).map(
		(m) => $data.members.find((p) => p.persona_id === m.persona_id)! as any,
	);
</script>

<div class="home">
	<!-- TODO display all members -->
	{#each personas as persona (persona.persona_id)}
		<div>{persona.name}</div>
	{/each}
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
</style>
