<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import {getApp} from '$lib/ui/app';
	import {format} from 'date-fns';

	const {
		ui: {expandMainNav},
	} = getApp();

	export let space: Readable<Space> | null;
	export let community: Readable<Community> | null;
</script>

<ul class="workspace-header" class:expanded-nav={$expandMainNav}>
	<li class="luggage-placeholder" />
	<li class="breadcrumbs">
		{community && $community && $community.name} / {(space &&
			$space &&
			$space.url.split('/').filter(Boolean).join(' / ')) ||
			''}
	</li>
	<li class="timestamp">created {space && $space && format(new Date($space.created), 'P')}</li>
</ul>

<style>
	.workspace-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: var(--navbar_size);
		width: 100%;
		background-color: var(--tint_dark_1);
		font-size: var(--font_size_xl);
	}
	.luggage-placeholder {
		width: var(--luggage_size);
		height: var(--luggage_size);
	}
	.breadcrumbs {
		padding: 0 var(--spacing_lg);
	}
	.timestamp {
		font-size: var(--font_size_md);
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}
	.expanded-nav .luggage-placeholder {
		display: none;
	}
	:global(.mobile) .workspace-header .luggage-placeholder {
		display: block;
	}
</style>
