<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import PersonaInfo from '$lib/ui/PersonaInfo.svelte';

	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	space;

	// TODO cache data better to speed this up!!
	$: personas = Array.from(memberPersonasById.values());
</script>

<div class="home">
	<!-- TODO display other meta info about the community -->
	{#each personas as persona (persona.persona_id)}
		<PersonaInfo {persona} />
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
