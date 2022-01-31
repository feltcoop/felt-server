<script lang="ts">
	import {page} from '$app/stores';
	import {stripStart} from '@feltcoop/felt/util/string.js';

	export let href: string;

	// TODO refactor this after upgrading SvelteKit to where `$page` has `url`
	// TODO move or upstream? rename? `printUrl`
	const formatUrl = (url: string): string => {
		url = stripStart(stripStart(url, 'https://'), 'http://'); // TODO probably leave http but not locally
		if (url.startsWith($page.host + '/')) {
			url = stripStart(url, $page.host);
		}
		return url;
	};
</script>

<!-- TODO could do more if we had the original `target` element (but it might go stale on $contextmenu?) -->
<!-- TODO if it's an external link, add `target="_blank" rel="noreferrer"` -->
<li role="none">
	<a {href}>
		<span class="icon">🔗</span>
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
	.icon {
		display: flex;
		font-size: var(--icon_size_sm);
	}
	.text {
		padding-left: var(--spacing_sm);
		overflow: hidden;
		overflow-wrap: break-word;
	}
</style>
