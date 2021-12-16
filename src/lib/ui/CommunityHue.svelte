<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {throttle} from 'throttle-debounce';

	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import HueInput from '$lib/ui/HueInput.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';

	const {dispatch} = getApp();

	export let community: Readable<Community>;

	// TODO better way to do this? updates when switching communities,
	// and updates only when actually changing the input --
	// can this be simplfied drastically by not using `bind:value` on the hue?
	let hue = $community.settings.hue;
	let lastHue = hue;
	let lastCommunity = community;
	$: if (lastCommunity !== community) {
		lastCommunity = community;
		hue = $community.settings.hue;
	}
	$: if (hue !== lastHue) {
		lastHue = hue;
		updateCommunityHue(hue);
	}
	const UPDATE_INTERVAL = 500; // TODO extract this to config
	const updateCommunityHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await dispatch('update_community_settings', {
			community_id: $community.community_id,
			settings: {hue},
		});
	});
</script>

<!-- TODO maybe add a title or tooltip explaining `community.settings.hue` -->
<HueInput bind:hue />
<div class="community-icon">
	<EntityIcon name={$community.name} type="Community" --hue={$community.settings.hue} />
</div>

<style>
	.community-icon {
		/* TODO instead of this, maybe have a "centered-box" or "box" or "flex-centered" or copy Tailwind */
		display: flex;
		justify-content: center;
	}
</style>
