<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';
	import {scale} from 'svelte/transition';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';

	// TODO clearly display when the thing has changed, and prominently show a save button
	// along with a "save all" button at the bottom (and for large forms, at the top too)

	export let space: Readable<Space>;
	export let community: Readable<Community>;

	const {dispatch, devmode} = getApp();

	let view: string; // initialized by `reset`
	let viewData: any;
	let viewPrinted: string | undefined;
	$: {
		try {
			viewData = JSON.parse(view);
			viewPrinted = JSON.stringify(viewData, null, 2);
		} catch (err) {
			viewPrinted = view;
		}
	}
	let pending = false;
	let viewEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	// TODO granular
	const reset = () => {
		view = JSON.stringify($space.view);
	};
	reset();

	const edit = () => {
		viewEl.focus();
	};

	const save = async () => {
		errorMessage = null;
		if (!changed) return;
		let updatedView: typeof $space['view'];
		try {
			updatedView = JSON.parse(view!);
		} catch (err) {
			errorMessage = 'invalid json';
			return;
		}
		pending = true;
		// TODO BLOCK not implemented -- should it be `UpdateSpaceView`?
		const result = await dispatch('UpdateSpace', {
			space_id: $space.space_id,
			view: updatedView,
		});
		pending = false;
		if (!result.ok) errorMessage = result.message;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await save();
		}
	};

	$: changed = view !== JSON.stringify($space.view); // TODO hacky

	// TODO BLOCK use `SpaceName` over `SpaceIcon` when merged
	// TODO BLOCK use the new CommunityAvatar
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
		<!-- TODO think this through -->
		<div>
			<div class="markup panel-inset">
				<pre>{JSON.stringify($space.view, null, 2)}</pre>
			</div>
			<div class="markup panel-outset">
				<p>
					{#if !changed}
						<button type="button" on:click={edit}>edit</button>
					{:else if view}<pre>{viewPrinted}</pre>{:else}<em>(empty)</em>{/if}
				</p>
			</div>
		</div>
		<textarea
			placeholder="> view"
			bind:this={viewEl}
			bind:value={view}
			use:autofocus
			disabled={pending}
			on:keydown={onKeydown}
		/>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		{#if changed}
			<div class="buttons" in:scale>
				<button type="button" on:click={reset}> reset </button>
				<button type="button" on:click={save} disabled={pending || !changed}> save </button>
			</div>
		{/if}
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
