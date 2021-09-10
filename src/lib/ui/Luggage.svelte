<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {api} = getApp();
</script>

<div class="luggage">
	<button class="icon-button" on:click={() => api.toggleMainNav()}> ☰ </button>
</div>

<style>
	.luggage {
		z-index: 3;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
