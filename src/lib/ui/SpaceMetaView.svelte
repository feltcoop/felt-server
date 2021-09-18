<script lang="ts">
	import type {Space} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import PersonaInfo from '$lib/ui/PersonaInfo.svelte';

	// TODO better name?

	export let community: Community;
	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	// TODO cache data better to speed this up!!
	$: personas = Array.from(memberPersonasById.values());
</script>

<!-- TODO display other meta info about the community -->
<section>
	{#each personas as persona (persona.persona_id)}
		<PersonaInfo {persona} />
	{/each}
</section>
