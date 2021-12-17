<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {throttle} from 'throttle-debounce';

	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import HueInput from '$lib/ui/HueInput.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';

	const {dispatch} = getApp();

	export let community: Readable<Community>;

	const UPDATE_INTERVAL = 500; // TODO extract this to config
	const updateHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await dispatch('update_community_settings', {
			community_id: $community.community_id,
			settings: {hue},
		});
	});
</script>

<!-- TODO maybe add a title or tooltip explaining `community.settings.hue` -->
<HueInput hue={$community.settings.hue} on:input={(e) => updateHue(e.detail)} />
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
