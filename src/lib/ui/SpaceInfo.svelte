<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import {randomHue} from '$lib/ui/color';

	export let space: Space;
	export let community: Readable<Community>;
	export let selected: boolean = false;

	$: hue = randomHue(space.name); // TODO add custom setting on spaces
</script>

<a
	href="/{$community.name}{space.url === '/' ? '' : space.url}"
	class:selected
	class="space-info"
	style="--hue: {hue}"
>
	<div class="name">{space.name}</div>
	<div>
		{space.url}
	</div>
</a>

<style>
	.space-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.name {
		font-size: var(--font_size_xl);
	}
</style>
