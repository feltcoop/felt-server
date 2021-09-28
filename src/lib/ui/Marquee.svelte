<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {toIcon, toName} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {expandMarquee},
	} = getApp();

	export let community: Readable<Community>;
	export let space: Readable<Space | null>;
</script>

<MarqueeNav {community} {space} />

<!-- TODO display other meta info about the community -->
{#if $expandMarquee}
	<section>
		<!-- TODO probably want these to be sorted so the selected persona is always first -->
		{#each $community.memberPersonas as persona (persona.persona_id)}
			<!-- TODO this is probably going to change to a store, maybe `Avatar` can optionally take one -->
			<Avatar name={toName(persona)} icon={toIcon(persona)} />
		{/each}
	</section>
{/if}
