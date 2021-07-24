<script>
	import {get_api} from '$lib/ui/api';

	const api = get_api();
</script>

<div class="workspace-header">
	<button on:click={() => api.toggle_main_nav()}> ☰ </button>
</div>

<style>
	.workspace-header {
		display: flex;
		height: var(--navbar_size);
		width: 100%;
	}
	button {
		width: var(--navbar_size);
		height: var(--navbar_size);
	}
</style>
