<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	const entry = contextmenu.addEntry();
	console.log('entry', entry);

	const select = (e: MouseEvent) => {
		e.stopPropagation();
		contextmenu.selectItem(entry);
	};

	// TODO remove $contextmenu if we make `entry` reactive, or delete this TODO
	$: ({selected} = ($contextmenu, entry));
</script>

<!-- TODO should be <a> ? but they don't have a `href` currently which is an a11y warning -- should they?
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
-->
<li class="menu-item" role="menuitem" class:selected on:click on:mousemove={select}>
	<slot />
</li>
