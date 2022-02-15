<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {type Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon, type Entity} from '$lib/vocab/entity/entity';

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

	let content = $entity.data.content;
	let status: AsyncStatus = 'initial'; // TODO refactor
	let contentEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
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
			await create();
		}
	};

	$: properties = Object.entries($entity);
</script>

<div class="markup column">
	<h2>Edit entity</h2>
	<section style:--icon_size="var(--icon_size_sm)">
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
		created {format(new Date($entity.created), 'Pp')}
	</section>
	<form>
		<label>
			<textarea
				placeholder="> content"
				bind:this={contentEl}
				bind:value={content}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
			content
		</label>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<button type="button" on:click={create} disabled={status === 'pending'}>
			Update entity data
		</button>
	</form>
	{#if $devmode}
		<hr />
		<section>
			<table>
				<thead>
					{#each properties as [key] (key)}
						<td>{key}</td>
					{/each}
				</thead>
				<tbody>
					<tr>
						{#each properties as [key, value] (key)}
							<td>{JSON.stringify(value)}</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</section>
	{/if}
</div>

<style>
	h2 {
		text-align: center;
	}
	/* TODO refactor reusable form stuff */
	label {
		flex-direction: column;
		/* TODO upstream to .markup or form in Felt */
		margin-bottom: var(--spacing_lg);
	}
	label textarea {
		margin-bottom: 0;
	}
	thead {
		font-weight: 700;
	}
	thead td {
		padding-right: var(--spacing_lg);
	}
</style>
