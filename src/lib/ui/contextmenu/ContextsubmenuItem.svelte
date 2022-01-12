<script lang="ts">
	// TODO add hover behavior that opens the submenu
	// TOOD add focus that opens the menu
	// TODO add toggle action to the button that opens the menu and focuses on the first item
	// TODO add larger transparent cursor hit area

	let focused = false;
	let hovered = false;
	$: open = focused || hovered;
</script>

<!-- TODO focusin and focusout are being used so they bubble, but keyboard controls aren't working still -->
<div
	class="contextsubmenu-item"
	on:mouseenter={() => (hovered = true)}
	on:mouseleave={() => (hovered = false)}
	on:focusin={() => (focused = true)}
	on:focusout={() => (focused = false)}
>
	<button type="button" class="menu-button" on:click|stopPropagation>
		<slot name="button" />
		<div class="chevron" />
	</button>
	{#if open}
		<div class="contextsubmenu pane" role="menu" style="transform: translate3d(100%, 0, 0)">
			<slot name="menu">TODO no menu content (make this a Message?)</slot>
		</div>
	{/if}
</div>

<style>
	.contextsubmenu-item {
		position: relative;
	}
	button {
		display: flex;
		align-items: center;
		/* TODO or maybe add a content div and `flex: 1` on it instead of this line */
		justify-content: space-between;
	}
	.chevron {
		padding-left: 5px;
	}
	.contextsubmenu {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--contextmenu_width);
	}
</style>
