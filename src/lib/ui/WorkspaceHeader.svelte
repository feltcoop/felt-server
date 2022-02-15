<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import {getApp} from '$lib/ui/app';
	import {format} from 'date-fns';
	import Avatar from '$lib/ui/Avatar.svelte';
	import SpaceIcon from './SpaceIcon.svelte';

	const {
		ui: {expandMainNav, expandMarquee},
	} = getApp();

	export let space: Readable<Space> | null;
	export let community: Readable<Community> | null;
</script>

<ul
	class="workspace-header"
	class:expanded-nav={$expandMainNav}
	class:expanded-marquee={$expandMarquee}
>
	<li class="luggage-placeholder" />
	<li class="breadcrumbs">
		{#if community && $community}<Avatar
				name={$community.name}
				showName={false}
				type="Community"
			/><span class="title">{$community.name}</span>{/if}{#if space}<SpaceIcon {space} />
			<span class="title">{$space?.url.split('/').filter(Boolean).join(' / ') || ''}</span>{/if}
	</li>
	<li class="timestamp">created {space && $space && format(new Date($space.created), 'P')}</li>
	<li class="marquee-button-placeholder" />
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
	.breadcrumbs {
		display: flex;
		align-items: center;
	}
	.timestamp {
		font-size: var(--font_size_md);
		flex: 1;
		display: flex;
		justify-content: flex-end;
		padding: 0 var(--spacing_lg);
	}
	.luggage-placeholder,
	.marquee-button-placeholder {
		width: var(--luggage_size);
		height: var(--luggage_size);
	}
	.expanded-nav .luggage-placeholder,
	.expanded-marquee .marquee-button-placeholder {
		display: none;
	}
	:global(.mobile) .workspace-header .luggage-placeholder,
	:global(.mobile) .workspace-header .marquee-button-placeholder {
		display: block;
	}
	.title {
		padding: 0 var(--spacing_xs);
	}
</style>
