<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	// TODO devmode support
	// import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import SpaceName from '$lib/ui/SpaceName.svelte';
	import {getApp} from '$lib/ui/app';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import {parseView, parseViewString, serializeView} from '$lib/vocab/view/view';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers';

	export let space: Readable<Space>;
	export let community: Readable<Community>;

	const {dispatch, devmode} = getApp();

	const updateSpace = async (updated: any, field: string) =>
		dispatch('UpdateSpace', {
			space_id: $space.space_id,
			[field]: field === 'view' ? parseView(updated) : updated,
		});
</script>

<div class="space-editor column">
	<div class="markup">
		<h2>Edit Space</h2>
		<section class="row" style:font-size="var(--font_size_xl)">
			<SpaceName {space} />
		</section>
		<section class="row">
			<span class="spaced">in</span>
			<CommunityAvatar {community} />
		</section>
		<section>
			<p>created {format(new Date($space.created), 'PPPPp')}</p>
			{#if $space.updated !== null}
				<p>updated {format(new Date($space.updated), 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<form>
		<ul>
			<li>
				<PropertyEditor value={$space.name} field="name" update={updateSpace} />
			</li>
			<li>
				<PropertyEditor value={$space.url} field="url" update={updateSpace} />
			</li>
			<li>
				<PropertyEditor
					value={$space.icon}
					field="icon"
					update={updateSpace}
					parse={parseSpaceIcon}
				/>
			</li>
			<li>
				<PropertyEditor
					value={serializeView($space.view)}
					field="view"
					update={updateSpace}
					parse={parseViewString}
				/>
			</li>
		</ul>
	</form>
	{#if $devmode}
		<hr />
		<section>
			TODO devmode stuff
			<!-- TODO need equivalent that works for spaces -->
			<!-- <EntityTable entity={space} /> -->
		</section>
	{/if}
</div>

<style>
	.space-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
	h2 {
		text-align: center;
	}
	form li {
		flex-direction: column;
		padding: var(--spacing_xl) 0;
	}
</style>
