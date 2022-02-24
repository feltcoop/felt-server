<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import ManageMembershipItem from '$lib/ui/ManageMembershipItem.svelte';

	const {
		ui: {personaSelection, communitiesBySessionPersona},
	} = getApp();

	$: persona = $personaSelection!;
	$: communities = $communitiesBySessionPersona.get(persona)!;
</script>

<div class="markup">
	<h1>Manage Memberships</h1>
	<section class="row">
		<!-- TODO likely make these a `select` or picker -->
		<em class="spaced">for</em>
		<PersonaAvatar {persona} />
	</section>
</div>
<ul>
	{#each communities as community (community)}
		<ManageMembershipItem {persona} {community} />
	{/each}
</ul>

<style>
	ul {
		padding: var(--spacing_xl);
	}
</style>
