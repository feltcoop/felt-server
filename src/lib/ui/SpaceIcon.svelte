<script lang="ts">
	import type {Readable} from 'svelte/store';
	import type {Space} from '$lib/vocab/space/space.js';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let space: Readable<Space>;

	//TODO more data driven system for this
	const spaceTypeIcons: Record<string, string> = {
		Home: '🏠',
		Room: '🗨',
		Board: '📚',
		Forum: '📋',
		Notes: '🏷',
		Voice: '🎙',
		Iframe: '💻',
		Todo: '🗒',
	};

	const defaultIcon = '🖊';

	$: icon = spaceTypeIcons[$space.view.type] ?? defaultIcon;
</script>

<UnicodeIcon {icon} />
