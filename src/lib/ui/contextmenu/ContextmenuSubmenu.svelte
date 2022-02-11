<script lang="ts">
	import {
		getContextmenu,
		getContextmenuDimensions,
		setContextmenuDimensions,
	} from '$lib/ui/contextmenu/contextmenu';

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

	const parentDimensions = getContextmenuDimensions();
	const dimensions = setContextmenuDimensions();

	let translateX = 0;
	let translateY = 0;
	$: if (el) updatePosition(el, $layout, $parentDimensions);
	const updatePosition = (
		el: HTMLElement,
		$layout: {width: number; height: number},
		$parentDimensions: {width: number; height: number},
	) => {
		const {x, y, width, height} = el.getBoundingClientRect();
		$dimensions = {width, height};
		const baseX = x - translateX;
		const baseY = y - translateY;
		const overflowRight = baseX + width + $parentDimensions.width - $layout.width;
		if (overflowRight <= 0) {
			translateX = $parentDimensions.width;
		} else {
			const overflowLeft = width - baseX;
			if (overflowLeft <= 0) {
				translateX = -width;
			} else if (overflowLeft > overflowRight) {
				translateX = $parentDimensions.width - overflowRight;
			} else {
				translateX = overflowLeft - width;
			}
		}
		translateY = Math.min(0, $layout.height - (baseY + height));
	};
</script>

<!-- TODO what's the right structure for a11y? -->
<li>
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
			class="pane"
			role="menu"
			style:transform="translate3d({translateX}px, {translateY}px, 0)"
			style:max-height="{$layout.height}px"
		>
			<slot name="menu" />
		</ul>
	{/if}
</li>

<style>
	li {
		position: relative;
	}
	.chevron {
		padding-left: 5px;
	}
	ul {
		z-index: 1;
		position: absolute;
		/* TODO this is a hack to avoid the pixel gap, probably change to 0 after adding transparent bg hitbox */
		left: -1px;
		top: 0;
		width: var(--contextmenu_width);
	}
</style>
