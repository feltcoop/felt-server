<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	const marquee_width = 320; // TODO where to get this?
	$: right = $ui.expandSecondaryNav ? marquee_width : 0;
</script>

<button
	class="icon-button"
	class:expanded={$ui.expandSecondaryNav}
	style="transform: translate3d({right}px, 0, 0)"
	aria-label="toggle marquee"
	on:click={ui.toggleSecondaryNav}
>
	<div class="content">⚆</div>
</button>

<style>
	button {
		z-index: 1;
		position: absolute;
		right: 0;
		top: 0;
		/* TODO this is janky because it can go offscreen for a bit,
		though it's a nice idea because it maintains object permanence */
		/* transition: transform var(--transition_duration_xs) ease-out; */
	}
	.content {
		transition: transform var(--transition_duration_xl) ease-in-out;
		transform: rotate(0deg);
	}
	.expanded .content {
		transform: rotate(180deg);
	}
	:global(.mobile) button {
		transform: translate3d(0, 0, 0) !important;
	}
	:global(.mobile) button.expanded {
		z-index: 4;
	}
</style>
