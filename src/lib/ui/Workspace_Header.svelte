<script lang="ts">
	import type {Space} from '$lib/spaces/space';
	import {get_app} from '$lib/ui/app';

	const {ui, api} = get_app();

	export let space: Space | null | undefined;
</script>

<div class="workspace-header" class:expanded-nav={$ui.expand_main_nav}>
	<button class="icon-button" on:click={() => api.toggle_main_nav()}> ☰ </button>
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
	.icon-button {
		margin-right: var(--spacing_lg);
	}
	.expanded-nav .icon-button {
		display: none;
	}
	/* `50rem` in media queries is the same as `800px`, which is `--column_width` */
	@media (max-width: 50rem) {
		.workspace-header .icon-button {
			display: block;
		}
	}
</style>
