<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';
	import {scale} from 'svelte/transition';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import {type Entity} from '$lib/vocab/entity/entity';

	// TODO clearly display when the thing has changed, and prominently show a save button
	// along with a "save all" button at the bottom (and for large forms, at the top too)

	export let done: (() => void) | undefined = undefined;
	export let entity: Readable<Entity>;

	const {
		dispatch,
		devmode,
		ui: {personaById},
	} = getApp();

	$: persona = personaById.get($entity.actor_id)!; // TODO should this be `Actor` and `actor`?

	let content: string; // initialized by `reset`
	let status: AsyncStatus = 'initial'; // TODO refactor
	let contentEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	// TODO granular
	const reset = () => {
		content = $entity.data.content;
	};
	reset();

	const edit = () => {
		contentEl.focus();
	};

	const save = async () => {
		//TODO validate inputs
		if (content.length > 100000) {
			errorMessage = 'too much content'; // TODO proper schema-based validation
			contentEl.focus();
			return;
		}
		status = 'pending';
		const result = await dispatch('UpdateEntity', {
			entity_id: $entity.entity_id,
			data: {...$entity.data, content}, // TODO support mulitple fields, not just `content`
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await save();
		}
	};

	$: changed = content !== $entity.data.content; // TODO hacky
</script>

<div class="markup column">
	<h2>Edit Entity</h2>
	<h3>creator</h3>
	<section style:--icon_size="var(--icon_size_sm)">
		<p><Avatar name={toName($persona)} icon={toIcon($persona)} /></p>
		<p>created {format(new Date($entity.created), 'PPPPp')}</p>
		{#if $entity.updated !== null}
			<p>updated {format(new Date($entity.updated), 'PPPPp')}</p>
		{/if}
	</section>
	<!-- TODO add entity property contextmenu actions to this -->
	<h3>content</h3>
	<form>
		<!-- TODO think this through -->
		<div class="side-by-side">
			<div>
				<div class="markup panel-inset">
					<p>{$entity.data.content}</p>
				</div>
				<div class="markup panel-outset">
					<p>
						{#if content === $entity.data.content}
							<button type="button" on:click={edit}>edit</button>
						{:else if content}{content}{:else}<em>(empty)</em>{/if}
					</p>
				</div>
			</div>
			<textarea
				placeholder="> content"
				bind:this={contentEl}
				bind:value={content}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
			{#if errorMessage}
				<Message status="error">{errorMessage}</Message>
			{/if}
		</div>
		{#if changed}
			<div class="buttons" in:scale>
				<button type="button" on:click={reset}> reset </button>
				<button type="button" on:click={save} disabled={status === 'pending' || !changed}>
					save
				</button>
			</div>
		{/if}
	</form>
	{#if $devmode}
		<hr />
		<section>
			<EntityTable {entity} />
		</section>
	{/if}
</div>

<style>
	h2 {
		text-align: center;
	}
	.side-by-side {
		display: flex;
	}
	.side-by-side > * {
		flex: 1;
	}
</style>
