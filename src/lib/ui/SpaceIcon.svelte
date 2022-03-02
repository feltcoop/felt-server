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

	const DEFAULT_ICON = '🖊';
	const DEFAULT_LABEL = 'Space';

	$: icon = spaceTypeIcons[$space.view.type] ?? DEFAULT_ICON;
	$: label = icon === DEFAULT_ICON ? DEFAULT_LABEL : $space.view.type;
</script>

<UnicodeIcon {icon} {label} />
