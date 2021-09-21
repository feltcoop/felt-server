<script lang="ts">
	import type {Space} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import SpaceMetaNav from '$lib/ui/SpaceMetaNav.svelte';
	import {toIcon, toName} from '$lib/vocab/entity/entity';

	// TODO better name?

	export let community: Community;
	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	// TODO cache data better to speed this up!!
	$: personas = Array.from(memberPersonasById.values());
</script>

<SpaceMetaNav {community} {space} />

<!-- TODO display other meta info about the community -->
<section>
	<!-- TODO probably want these to be sorted so the selected persona is always first -->
	{#each personas as persona (persona.persona_id)}
		<Avatar name={toName(persona)} icon={toIcon(persona)} />
	{/each}
</section>
