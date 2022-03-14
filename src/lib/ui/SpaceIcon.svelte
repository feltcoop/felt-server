<script lang="ts">
	import type {Readable} from 'svelte/store';
	import type {Space} from '$lib/vocab/space/space.js';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import {toViewType} from '$lib/vocab/view/view';

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

	$: type = toViewType($space.view);
	$: icon = type === undefined || !(type in spaceTypeIcons) ? DEFAULT_ICON : spaceTypeIcons[type];
	$: label = type === undefined ? DEFAULT_LABEL : type;
</script>

<UnicodeIcon {icon} {label} />
