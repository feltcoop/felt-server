<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {identity} from '@feltcoop/felt/util/function.js';
	import type {Result} from '@feltcoop/felt';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';

	// TODO make this work with other kinds of inputs, starting with numbers

	type TValue = $$Generic;

	export let value: TValue;
	export let field: string;
	export let update: (
		updated: TValue,
		field: string,
	) => Promise<Result<unknown, {message: string}>>;
	export let parse: (serialized: string) => Result<{value: TValue}, {message: string}> = (
		serialized,
	) => ({ok: true, value: serialized as any}); // TODO consider extracting an `ok` helper
	export let serialize: (value: TValue, print?: boolean) => string = identity as any; // TODO type

	let editing = false;

	let fieldValue: any; // initialized by `reset`
	let serialized: string | undefined;
	$: {
		const parsed = parse(fieldValue);
		if (parsed.ok) {
			serialized = serialize(parsed.value, true);
			errorMessage = null;
		} else {
			serialized = '';
			errorMessage = parsed.message;
		}
	}
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	const reset = () => {
		fieldValue = serialize(value);
	};
	reset();

	const edit = () => {
		editing = true;
		setTimeout(() => fieldValueEl.focus());
	};
	const stopEditing = () => {
		editing = false;
	};

	const save = async () => {
		errorMessage = null;
		if (!changed) return;
		const parsed = parse(fieldValue);
		if (!parsed.ok) {
			errorMessage = parsed.message;
			return;
		}
		pending = true;
		const result = await update(parsed.value, field);
		pending = false;
		if (result.ok) {
			stopEditing();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			await save();
		}
	};

	$: currentSerialized = serialize(value, true);
	$: changed = serialized !== currentSerialized;
</script>

<div class="field">{field}</div>
<div class="preview markup padded-xl panel-inset">
	<pre>{currentSerialized}</pre>
</div>
{#if editing}
	{#if changed}
		<div class="buttons">
			<button type="button" on:click={reset}> reset </button>
			<PendingButton on:click={save} {pending} disabled={pending || !!errorMessage}>
				save
			</PendingButton>
		</div>
	{:else}
		<button type="button" on:click={stopEditing}>cancel</button>
	{/if}
	<textarea
		placeholder="> value"
		bind:this={fieldValueEl}
		bind:value={fieldValue}
		use:autofocus
		disabled={pending}
		on:keydown={onKeydown}
	/>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{:else if changed}
		<div class="preview markup padded-xl panel-outset">
			<p>
				{#if fieldValue}<pre>{serialized}</pre>{:else}<em>(empty)</em>{/if}
			</p>
		</div>
	{/if}
{:else}
	<button type="button" on:click={edit}>edit</button>
{/if}

<style>
	.field {
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
	.preview {
		overflow: auto;
	}
</style>
