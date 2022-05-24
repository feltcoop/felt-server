<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';

	export let space: Readable<Space>;

	const {
		ui: {lastSeenByDirectoryId},
	} = getApp();

	$: lastSeen = $lastSeenByDirectoryId.value.get($space.directory_id)!;
	$: console.log('lastSeen is', $lastSeen);

	$: systemTime = $space.updated ? $space.updated : $space.created;
	$: console.log('systemTime is:', systemTime);
	$: clientTime = new Date($lastSeen);
	$: console.log('clientTime is:', clientTime);

	$: fresh = clientTime < systemTime;
	$: console.log('freshness is:', fresh);
</script>

<SpaceIcon {space} />
<span
	>{$space.name}
	{#if fresh}❗{/if}
</span>

<style>
	span {
		padding: var(--spacing_xs);
	}
</style>
