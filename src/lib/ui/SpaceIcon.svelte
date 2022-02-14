<script lang="ts">
	import type {Readable} from 'svelte/store';
	import type {Space} from '$lib/vocab/space/space.js';

	export let space: Readable<Space>;

	//TODO more data driven system for this
	const spaceTypeIcons: Record<string, string> = {
		Home: '🏠',
		Room: '🗨',
		Board: '	📚',
		Forum: '📋',
		Notes: '🏷',
		Voice: '🎙',
		Iframe: '💻',
		Todo: '🗒',
	};

	const defaultIcon = '🖊';

	$: icon = spaceTypeIcons[$space.view.type] ?? defaultIcon;
</script>

<span>{icon}</span>

<style>
	span {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-right: var(--spacing_xs);
		width: var(--icon_size_sm);
	}
</style>
