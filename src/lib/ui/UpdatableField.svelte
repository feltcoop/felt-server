<script lang="ts" context="module">
	const resultIdentity = (value: any): Result<{value: any}, {message: string}> => ({
		ok: true,
		value,
	});
</script>

<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {type Readable} from 'svelte/store';
	import {identity} from '@feltcoop/felt/util/function.js';
	import {type Result} from '@feltcoop/felt';

	import {autofocus} from '$lib/ui/actions';

	// TODO make this work with other kinds of inputs, starting with numbers

	export let value: Readable<Record<string, any>>; // TODO generic type
	export let field: string; // TODO type keyof typeof T
	export let update: (
		updated: any,
		field: string,
		$value: any,
	) => Promise<Result<any, {message: string}>>; // TODO type
	export let parse: (updated: any) => Result<{value: any}, {message: string}> = resultIdentity; // TODO type
	export let serialize: (raw: any, print?: boolean) => any = identity; // TODO type

	let editing = false;

	let fieldValue: any; // initialized by `reset`
	let raw: any;
	let serialized: string | undefined;
	$: {
		const parsed = parse(fieldValue);
		if (parsed.ok) {
			raw = parsed.value;
			serialized = serialize(raw, true);
		} else {
			serialized = fieldValue;
		}
	}
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	// TODO granular
	const reset = () => {
		fieldValue = serialize($value[field]);
	};
	reset();

	const edit = () => {
		editing = true;
		setTimeout(() => fieldValueEl.focus());
	};
	const cancel = () => {
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
		const result = await update(parsed.value, field, $value);
		pending = false;
		if (result.ok) {
			cancel();
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

	$: changed = fieldValue !== serialize($value[field]); // TODO hacky
</script>

<div class="field">{field}</div>
<div class="row">
	<div class="markup panel-inset">
		<pre>{serialize($value[field], true)}</pre>
	</div>
</div>
{#if editing}
	<textarea
		placeholder="> fieldValue"
		bind:this={fieldValueEl}
		bind:value={fieldValue}
		use:autofocus
		disabled={pending}
		on:keydown={onKeydown}
	/>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
	{#if changed}
		<div class="buttons">
			<button type="button" on:click={reset}> reset </button>
			<button type="button" on:click={save} disabled={pending || !changed}> save </button>
		</div>
		<div class="markup panel-outset">
			<p>
				{#if fieldValue}<pre>{serialized}</pre>{:else}<em>(empty)</em>{/if}
			</p>
		</div>
	{:else}
		<button type="button" on:click={cancel}>cancel</button>
	{/if}
{:else}
	<button type="button" on:click={edit}>edit</button>
{/if}

<style>
	.field {
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
</style>
