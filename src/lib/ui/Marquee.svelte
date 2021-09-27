<script lang="ts">
	import type {Space} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {toIcon, toName} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	export let community: Community;
	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	// TODO cache data better to speed this up!!
	$: personas = Array.from(memberPersonasById.values());
</script>

<MarqueeNav {community} {space} />

<!-- TODO display other meta info about the community -->
{#if $ui.expandSecondaryNav}
	<section>
		<!-- TODO probably want these to be sorted so the selected persona is always first -->
		{#each personas as persona (persona.persona_id)}
			<Avatar name={toName(persona)} icon={toIcon(persona)} />
		{/each}
	</section>
{/if}
