<script lang="ts">
	import type {Space} from '$lib/spaces/space';
	import type {Community} from '$lib/communities/community';
	import {get_app} from '$lib/ui/app';

	const {ui} = get_app();

	export let space: Space | null | undefined;
	export let community: Community | null | undefined;
</script>

<ul class="workspace-header" class:expanded-nav={$ui.expand_main_nav}>
	<li class="luggage-placeholder" />
	<li class="breadcrumbs">
		{community?.name} / {space?.url.split('/').filter(Boolean).join(' / ') || ''}
	</li>
</ul>

<style>
	.workspace-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: var(--navbar_size);
		width: 100%;
		border-bottom: var(--border);
		font-size: var(--font_size_xl);
	}
	.luggage-placeholder {
		width: var(--luggage_size);
		height: var(--luggage_size);
	}
	.breadcrumbs {
		padding: 0 var(--spacing_lg);
	}
	.expanded-nav .luggage-placeholder {
		display: none;
	}
	/* `50rem` in media queries is the same as `800px`, which is `--column_width` */
	@media (max-width: 50rem) {
		.workspace-header .luggage-placeholder {
			display: block;
		}
	}
</style>
