<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import ManageMembershipItem from '$lib/ui/ManageMembershipItem.svelte';

	const {
		ui: {personaSelection, communitiesBySessionPersona},
	} = getApp();

	$: persona = $personaSelection!;
	$: communities = $communitiesBySessionPersona.get(persona)!;
</script>

<div class="markup">
	<h1>Manage memberships</h1>
	<div class="avatar"><Avatar name={$persona.name} /></div>
	<form>
		<ul>
			{#each communities as community (community)}
				<ManageMembershipItem {persona} {community} />
			{/each}
		</ul>
	</form>
</div>

<style>
	.markup {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
