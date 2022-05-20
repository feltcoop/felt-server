<script lang="ts">
	import {page} from '$app/stores';
	import {stripStart} from '@feltcoop/felt/util/string.js';

	import {getApp} from '$lib/ui/app';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let href: string;

	const {
		ui: {contextmenu},
	} = getApp();

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
	<a class="menu-item" {href} {rel} on:click={() => contextmenu.close()}>
		<div class="content">
			<div class="icon">
				<UnicodeIcon icon="🔗" />
			</div>
			<div class="title">
				<span class="text">{text}</span>
			</div>
		</div>
	</a>
</li>

<style>
	/* Underline only the link text, not the icon. */
	a:hover {
		text-decoration: none;
	}
	a:hover .text {
		text-decoration: underline;
	}
</style>
