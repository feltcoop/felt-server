<script lang="ts">
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import UpdatableField from '$lib/ui/UpdatableField.svelte';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';

	export let space: Readable<Space>;
	export let community: Readable<Community>;

	const {dispatch, devmode} = getApp();

	// TODO BLOCK use `SpaceName` over `SpaceIcon` when merged
	// TODO BLOCK use the new CommunityAvatar

	const updateSpace = async (updated: object, field: string, $value: Space) =>
		dispatch('UpdateSpace', {
			space_id: $value.space_id,
			[field]: updated,
		});
</script>

<div class="markup column">
	<h2>Edit Space</h2>
	<section class="row">
		<p style="display: flex"><SpaceIcon {space} /> {$space.name}</p>
	</section>
	<section class="row">
		<em class="spaced">in</em>
		{$community.name}
		<!-- <CommunityAvatar {community} /> -->
	</section>
	<section>
		<p>created {format(new Date($space.created), 'PPPPp')}</p>
		{#if $space.updated !== null}
			<p>updated {format(new Date($space.updated), 'PPPPp')}</p>
		{/if}
	</section>
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<UpdatableField value={space} field="name" update={updateSpace} />
		<UpdatableField value={space} field="url" update={updateSpace} />
		<UpdatableField
			value={space}
			field="view"
			update={updateSpace}
			parse={parseJson}
			serialize={serializeJson}
		/>
	</form>
	{#if $devmode}
		<hr />
		<section>
			<!-- TODO does this work? -->
			<EntityTable entity={space} />
		</section>
	{/if}
</div>

<style>
	h2 {
		text-align: center;
	}
</style>
