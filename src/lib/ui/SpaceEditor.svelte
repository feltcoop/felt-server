<script lang="ts">
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';
	import {type Result} from '@feltcoop/felt';

	import EditableField from '$lib/ui/EditableField.svelte';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import {getApp} from '$lib/ui/app';

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

	const parseJson = (value: string): Result<{value: object}, {message: string}> => {
		try {
			const parsed = JSON.parse(value);
			return {ok: true, value: parsed};
		} catch (err) {
			return {ok: false, message: 'invalid json'};
		}
	};

	const serializeJson = (raw: any, print?: boolean) =>
		print ? JSON.stringify(raw, null, 2) : JSON.stringify(raw);
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
	<h3>view</h3>
	<form>
		<EditableField value={space} field="name" update={updateSpace} />
		<EditableField value={space} field="url" update={updateSpace} />
		<EditableField
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
