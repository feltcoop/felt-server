<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {throttle} from 'throttle-debounce';
	import HueInput from '@feltcoop/felt/ui/HueInput.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';

	const {dispatch} = getApp();

	export let community: Readable<Community>;

	const UPDATE_INTERVAL = 500; // TODO extract this to config
	const updateHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await dispatch.UpdateCommunitySettings({
			community_id: $community.community_id,
			settings: {hue},
		});
	});
</script>

<!-- TODO maybe add a title or tooltip explaining `community.settings.hue` -->
<HueInput hue={$community.settings.hue} on:input={(e) => updateHue(e.detail)} />
