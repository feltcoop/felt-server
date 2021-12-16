<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {throttle} from 'throttle-debounce';

	import type {Space} from '$lib/vocab/space/space.js';
	import Avatar from '$lib/ui/Avatar.svelte';
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import HueInput from '$lib/ui/HueInput.svelte';
	import SpaceInfo from '$lib/ui/SpaceInfo.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {toName, toIcon} from '$lib/vocab/entity/entity';

	const {
		ui: {selectedSpace, spacesByCommunityId},
		api: {dispatch},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	space; // TODO we're ignoring the space, but should probably mount its `content` as markup

	$: communitySpaces = $spacesByCommunityId.get($community.community_id)!;

	let hue = $community.settings.hue;
	$: if (hue !== $community.settings.hue) updateCommunityHue(hue);
	const UPDATE_INTERVAL = 200; // TODO extract this to config
	const updateCommunityHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await dispatch('update_community_settings', {
			community_id: $community.community_id,
			settings: {hue},
		});
	});
</script>

<div class="markup">
	<section>
		<h2>members</h2>
		<!-- TODO display other meta info about the community -->
		{#each $community.memberPersonas as persona (persona.persona_id)}
			<Avatar name={toName(persona)} icon={toIcon(persona)} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>community spaces</h2>
		{#each communitySpaces as communitySpace (communitySpace)}
			<SpaceInfo
				{persona}
				space={communitySpace}
				{community}
				selected={selectedSpace && communitySpace === $selectedSpace}
			/>
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>activity</h2>
		<div>This community was created at {$community.created}</div>
		<code>TODO</code>
	</section>
	<section>
		<h2>settings</h2>
		<!-- TODO maybe add a title or tooltip explaining `community.settings.hue` -->
		<HueInput bind:hue />
		<div class="community-icon">
			<EntityIcon name={$community.name} type="Community" --hue={$community.settings.hue} />
		</div>
	</section>
</div>

<style>
	section {
		margin: var(--spacing_xl4) 0;
	}
	.community-icon {
		/* TODO instead of this, maybe have a "centered-box" or "box" or "flex-centered" or copy Tailwind */
		display: flex;
		justify-content: center;
	}
</style>
