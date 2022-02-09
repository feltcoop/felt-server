<script lang="ts">
	import {getContextmenu} from '$lib/ui/contextmenu/contextmenu';

	const contextmenu = getContextmenu();

	// TODO add larger transparent cursor hit area

	const submenu = contextmenu.addSubmenu();

	const select = () => {
		if (!selected) contextmenu.selectItem(submenu);
	};

	$: ({layout} = contextmenu);

	// the `$contextmenu` is needed because `submenu` is not reactive
	$: ({selected} = ($contextmenu, submenu));

	let el: HTMLElement;

	// TODO BLOCK if it still doesn't fit onscreen, we need to choose the best side and clamp to the screen
	// TODO BLOCK test with 3 levels deep
	let translateX = '0px';
	$: updatePosition(el, $layout);
	const updatePosition = (
		el: HTMLElement | undefined,
		$layout: {width: number; height: number},
	) => {
		if (!el) {
			translateX = '0px';
			return;
		}
		const rect = el.getBoundingClientRect();
		console.log('rect', rect);
		// TODO change to reactive statements?
		const parentWidth = 360; // TODO do we need the precise dimensions of the parent element or can we get away without them?
		const {x, width} = rect;
		// Does it fit onscreen to the right? If so just set x to 100%.
		const overflowRight = x + width + parentWidth - $layout.width;
		console.log('overflowRight', overflowRight);
		if (overflowRight <= 0) {
			translateX = '100%';
		} else {
			translateX = '-100%';
		}
	};
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
		<ul
			bind:this={el}
			class="contextmenu-submenu pane"
			role="menu"
			style="transform: translate3d({translateX}, 0, 0)"
		>
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
