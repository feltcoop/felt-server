<script lang="ts">
	import {page} from '$app/stores';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import {stripStart} from '@feltcoop/felt/util/string.js';

	export let href: string;

	// TODO refactor this after upgrading SvelteKit to where `$page` has `url`
	// TODO move or upstream? rename? `printUrl`
	const formatUrl = (url: string): string => {
		const formatted = stripStart(stripStart(url, 'https://'), 'http://'); // TODO probably leave http but not locally
		return formatted.startsWith($page.url.host + '/')
			? stripStart(formatted, $page.url.host)
			: formatted;
	};
</script>

<!-- TODO could do more if we had the original `target` element (but it might go stale on $contextmenu?) -->
<!-- TODO if it's an external link, add `target="_blank" rel="noreferrer"` -->
<li role="none">
	<a {href}>
		<UnicodeIcon icon="🔗" />
		<span class="text">{formatUrl(href)}</span>
	</a>
</li>

<style>
	a {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--spacing_sm);
	}
	.text {
		padding-left: var(--spacing_sm);
		overflow: hidden;
		overflow-wrap: break-word;
	}
</style>
