<script lang="ts">
	import {page} from '$app/stores';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import {stripStart} from '@feltcoop/felt/util/string.js';

	export let href: string;

	// TODO refactor this after upgrading SvelteKit to where `$page` has `url`
	// TODO move or upstream? rename? `printUrl`
	const formatUrl = (url: string): string => {
		const formatted = stripStart(stripStart(url, 'https://'), 'http://');
		return formatted.startsWith($page.url.host + '/')
			? stripStart(formatted, $page.url.host)
			: formatted;
	};

	$: text = formatUrl(href);
	$: external = !(text.startsWith('.') || text.startsWith('/'));
	$: rel = external ? 'noreferrer' : undefined;
</script>

<!-- TODO this doesn't work with the keyboard controls, need to use `menuitem` -->
<!-- TODO could do more if we had the original `target` element (but it might go stale on $contextmenu?) -->
<li role="none">
	<a {href} {rel}>
		<UnicodeIcon icon="🔗" />
		<span class="text">{text}</span>
	</a>
</li>

<style>
	a {
		display: flex;
		align-items: center;
		width: 100%;
	}
	a:hover {
		text-decoration: none;
	}
	a:hover .text {
		text-decoration: underline;
	}
	.text {
		padding: 0 var(--spacing_sm);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
