<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';

	export let space: Readable<Space>;

	const {
		ui: {lastSeenByDirectoryId, entityById},
	} = getApp();

	$: directory = entityById.get($space.directory_id)!;
	$: lastSeen = $lastSeenByDirectoryId.value.get($space.directory_id)!;
	$: systemTime = $directory.updated ?? $directory.created;
	$: clientTime = new Date($lastSeen);
	$: fresh = clientTime < systemTime;
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
