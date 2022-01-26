<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	// TODO add toggle action to the button that opens the menu and focuses on the first item
	// TODO add larger transparent cursor hit area
	// TODO fix keyboard nav (is the delay between focus the problem?)

	// should this set context so we automatically know where it's nested? set using the id?
	const submenu = contextmenu.addSubmenu();
	console.log('submenu', submenu);

	const select = () => {
		if (!selected) contextmenu.selectItem(submenu);
	};

	// TODO remove $contextmenu if we make `submenu` reactive, or delete this TODO
	$: ({selected} = ($contextmenu, submenu));
</script>

<!-- TODO what's the right structure for a11y? -->
<li class="contextmenu-submenu-item">
	<div
		class="menu-item"
		role="menuitem"
		class:selected
		on:click|stopPropagation
		on:mousemove|stopPropagation={select}
		aria-expanded={selected}
	>
		<slot name="entry" />
		<div class="chevron" />
	</div>
	{#if selected}
		<ul class="contextmenu-submenu pane" role="menu" style="transform: translate3d(100%, 0, 0)">
			<slot name="menu" />
		</ul>
	{/if}
</li>

<style>
	.contextmenu-submenu-item {
		position: relative;
	}
	.chevron {
		padding-left: 5px;
	}
	.contextmenu-submenu {
		position: absolute;
		/* TODO this is a hack to avoid the pixel gap, probably change to 0 after adding transparent bg hitbox */
		left: -1px;
		top: 0;
		width: var(--contextmenu_width);
	}
</style>
