<script lang="ts">
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();
</script>

<button class="luggage icon-button" on:click={() => api.toggle_main_nav()}> ☰ </button>

<style>
	.luggage {
		z-index: 9;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
