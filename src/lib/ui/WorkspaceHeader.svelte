<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {expandMainNav},
	} = getApp();

	export let space: Readable<Space | null>;
	export let community: Readable<Community> | null;
</script>

<ul class="workspace-header" class:expanded-nav={$expandMainNav}>
	<li class="luggage-placeholder" />
	<li class="breadcrumbs">
		{community && $community.name} / {$space?.url.split('/').filter(Boolean).join(' / ') || ''}
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
	:global(.mobile) .workspace-header .luggage-placeholder {
		display: block;
	}
</style>
