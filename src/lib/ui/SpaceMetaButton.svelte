<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();
</script>

<button class="icon-button" on:click={ui.toggleSecondaryNav}> ⚆ </button>

<style>
	button {
		position: absolute;
		right: 0;
		top: 0;
	}
</style>
