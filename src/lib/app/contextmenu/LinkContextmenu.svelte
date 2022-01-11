<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {page} from '$app/stores';
	import {stripStart} from '@feltcoop/felt/util/string.js';

	export let contextmenu: ContextmenuStore;

	// TODO refactor this after upgrading SvelteKit to where `$page` has `url`
	// TODO move or upstream? rename? `printUrl`
	const formatUrl = (url: string): string => {
		url = stripStart(stripStart(url, 'https://'), 'http://'); // TODO probably leave http but not locally
		if (url.startsWith($page.host + '/')) {
			url = stripStart(url, $page.host);
		}
		return url;
	};

	// TODO strip any local url prefix
	$: value = $contextmenu.items.LinkContextmenu;
</script>

<!-- TODO could do more if we had the original `target` element
							(but it might go stale on $contextmenu?) -->
<!-- TODO if it's an external link, add target="_blank" -->
<a href={value}>
	<span class="icon">🔗</span>
	{formatUrl(value)}
</a>

<style>
	a {
		display: flex;
		align-items: center;
		width: 100%;
		word-break: break-word;
	}
	.icon {
		display: flex;
		font-size: var(--icon_size_sm);
		padding: var(--spacing_sm);
	}
</style>
