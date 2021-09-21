<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	const space_meta_width = 320; // TODO where to get this?
	$: right = $ui.expandSecondaryNav ? -space_meta_width : 0;
</script>

<button class="icon-button" style="right: {right}px" on:click={ui.toggleSecondaryNav}> ⚆ </button>

<style>
	button {
		z-index: 1;
		position: absolute;
		right: 0;
		top: 0;
		transition: right var(--transition_duration_xs) ease-out;
	}
</style>
