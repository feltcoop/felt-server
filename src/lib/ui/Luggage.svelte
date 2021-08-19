<script lang="ts">
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();
</script>

<div class="luggage">
	<button class="icon-button" on:click={() => api.toggle_main_nav()}> ☰ </button>
</div>

<style>
	.luggage {
		z-index: 3;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
