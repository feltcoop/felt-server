<script lang="ts">
	import {getContextmenu} from '$lib/ui/contextmenu/contextmenu';

	const contextmenu = getContextmenu();

	// TODO add larger transparent cursor hit area

	const submenu = contextmenu.addSubmenu();

	const select = () => {
		if (!selected) contextmenu.selectItem(submenu);
	};

	// the `$contextmenu` is needed because `submenu` is not reactive
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
