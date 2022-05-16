<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Community} from '$lib/vocab/community/community';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import CommunitySettingsHue from '$lib/ui/CommunitySettingsHue.svelte';

	export let community: Readable<Community>;
</script>

<div class="community-editor column">
	<div class="markup">
		<h1>Edit Community</h1>
		<section class="row" style:font-size="var(--font_size_xl)">
			<CommunityAvatar {community} />
		</section>
		<section>
			<p>created {format($community.created, 'PPPPp')}</p>
			{#if $community.updated !== null}
				<p>updated {format($community.updated, 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<section>
		<CommunitySettingsHue {community} />
	</section>
</div>

<style>
	.community-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
	h1 {
		text-align: center;
	}
</style>
