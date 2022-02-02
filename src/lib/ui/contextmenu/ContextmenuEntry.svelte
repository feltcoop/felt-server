<script lang="ts">
	import {getContextmenu, type ContextmenuAction} from '$lib/ui/contextmenu/contextmenu';

	export let action: ContextmenuAction;

	const contextmenu = getContextmenu();

	const entry = contextmenu.addEntry(action);

	const select = (e: MouseEvent) => {
		e.stopPropagation();
		contextmenu.selectItem(entry);
	};

	// the `$contextmenu` is needed because `entry` is not reactive
	$: ({selected} = ($contextmenu, entry));
</script>

<!-- TODO should be <a> ? But they don't have a `href` currently which is an a11y warning -- should they?
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
or should they be <button> ? But then how do we deal with focus?
(in Chrome/FF contextmenus, `Tab` doesn't work, but maybe it should here?)
-->
<li
	class="menu-item"
	role="menuitem"
	class:selected
	on:click={() => action()}
	on:mousemove={select}
>
	<slot />
</li>
