<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	const space_meta_width = 320; // TODO where to get this?
	$: right = $ui.expandSecondaryNav ? space_meta_width : 0;
</script>

<button
	class="icon-button"
	class:expanded={$ui.expandSecondaryNav}
	style="transform: translate3d({right}px, 0, 0)"
	aria-label="toggle space meta"
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
		transition: transform var(--transition_duration_xs) ease-out;
	}
	.content {
		transition: transform var(--transition_duration_xl) ease-in-out;
		transform: rotate(180deg);
	}
	.expanded .content {
		transform: rotate(0deg);
	}
</style>
