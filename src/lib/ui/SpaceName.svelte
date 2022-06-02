<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';

	export let space: Readable<Space>;

	const {
		ui: {freshnessByDirectoryId},
	} = getApp();

	$: fresh = $freshnessByDirectoryId.get($space.directory_id)!;
</script>

<SpaceIcon {space} />
<span
	>{$space.name}
	{#if $fresh}❗{/if}
</span>

<style>
	span {
		padding: var(--spacing_xs);
	}
</style>
