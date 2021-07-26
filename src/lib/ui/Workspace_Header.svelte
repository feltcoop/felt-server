<script lang="ts">
	import {get_api} from '$lib/ui/api';
	import type {Space} from '$lib/spaces/space';

	const api = get_api();

	export let space: Space | null | undefined;
</script>

<div class="workspace-header">
	<button on:click={() => api.toggle_main_nav()}> ☰ </button>
	<div>{space?.url}</div>
</div>

<style>
	.workspace-header {
		display: flex;
		align-items: center;
		height: var(--navbar_size);
		width: 100%;
		border-bottom: var(--border);
		font-size: var(--font_size_xl);
	}
	button {
		width: var(--navbar_size);
		height: var(--navbar_size);
		margin-right: var(--spacing_lg);
	}
</style>
