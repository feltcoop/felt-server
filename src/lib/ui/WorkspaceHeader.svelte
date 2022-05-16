<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import {getApp} from '$lib/ui/app';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';

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
		{#if community && $community}<CommunityAvatar
				{community}
				showName={false}
				contextmenuAction={null}
			/><span class="title">{$community.name}</span>{/if}{#if space}<SpaceIcon {space} />
			<span class="title">{$space?.url.split('/').filter(Boolean).join(' / ') || ''}</span>{/if}
	</li>
	<li class="marquee-button-placeholder" />
</ul>

<style>
	.workspace-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: var(--navbar_size);
		width: 100%;
		overflow: hidden;
		background-color: var(--tint_dark_1);
		font-size: var(--font_size_lg);
	}
	.breadcrumbs {
		display: flex;
		align-items: center;
	}
	.luggage-placeholder,
	.marquee-button-placeholder {
		width: var(--luggage_size);
		min-width: var(--luggage_size);
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
		white-space: nowrap;
	}
</style>
