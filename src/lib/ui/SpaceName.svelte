<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';

	export let space: Readable<Space>;

	const {
		ui: {lastSeenByDirectoryId, entityById, spaceSelection},
	} = getApp();

	//TODO replace selected with more cohesive control in Update mutation
	$: selected = $spaceSelection === space;
	$: directory = entityById.get($space.directory_id)!;
	$: lastSeen = $lastSeenByDirectoryId.value.get($space.directory_id)!;
	//TODO replace space timestamps with directory timestamps
	$: systemTime = $directory.updated ?? $directory.created;
	$: clientTime = new Date($lastSeen);
	$: fresh = !selected && clientTime < systemTime;
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
