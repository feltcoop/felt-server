<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {identity} from '@feltcoop/felt/util/function.js';
	import {type Result, ok} from '@feltcoop/felt';
	import {compile as stringifySvast} from 'svast-stringify';
	import {parse as parseSvast} from 'svelte-parse';

	import {autofocus} from '$lib/ui/actions';
	import {type ViewData} from '$lib/vocab/view/view';

	// TODO make this work with other kinds of inputs, starting with numbers

	export let value: ViewData; // TODO generic type
	export let field: string; // TODO type keyof typeof T
	export let update: (updated: any, field: string) => Promise<Result<any, {message: string}>>; // TODO type
	export let parse: (updated: any) => Result<{value: any}, {message: string}> = ok; // TODO type
	export let serialize: (raw: any, print?: boolean) => any = identity; // TODO type

	// TODO types
	const transform = (value: any): any => stringifySvast(value);
	const untransform = (value: any): any => parseSvast({value, generatePositions: false});

	let editing = false;

	let rawSerialized: any; // initialized by `reset`
	let rawTransformed: any; // initialized by `reset`
	let previewSerialized: string | undefined;
	let previewTransformed: string | undefined;
	$: setSerialized(rawSerialized);
	$: setTransformed(rawTransformed);
	let pending = false;
	let rawSerializedEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	$: currentSerialized = serialize(value, true);
	$: currentTransformed = transform(value);

	const setSerialized = (rawSerialized: string): void => {
		console.log('setSerialized');
		const parsed = parse(rawSerialized);
		if (parsed.ok) {
			previewSerialized = serialize(parsed.value, true);
			previewTransformed = transform(parsed.value);
		} else {
			previewSerialized = rawSerialized;
			previewTransformed = undefined;
		}
		// TODO BLOCK set current transformed -- but is this the same as reactively setting the code?
	};
	const setTransformed = (rawTransformed: string): void => {
		console.log('setTransformed');
		const a = rawSerialized;
		const parsed = untransform(rawTransformed);
		rawSerialized = serialize(parsed);
		setSerialized(rawSerialized);
		console.log(`rawSerialized changed`, a !== rawSerialized);
	};

	const reset = () => {
		rawSerialized = serialize(value);
		rawTransformed = transform(value);
	};
	reset();

	const edit = () => {
		editing = true;
		setTimeout(() => rawSerializedEl.focus());
	};
	const cancel = () => {
		editing = false;
	};

	const save = async () => {
		errorMessage = null;
		if (!changed) return;
		const parsed = parse(rawSerialized);
		if (!parsed.ok) {
			errorMessage = parsed.message;
			return;
		}
		pending = true;
		const result = await update(parsed.value, field);
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

	$: changed = rawSerialized !== serialize(value); // TODO hacky
</script>

<div class="field">{field}</div>
<div class="preview markup panel-inset">
	<pre>{currentSerialized}</pre>
</div>
<div class="preview markup panel-outset">
	<pre>{currentTransformed}</pre>
</div>
{#if editing}
	{#if changed}
		<div class="buttons">
			<button type="button" on:click={reset}> reset </button>
			<button type="button" on:click={save} disabled={pending || !changed}> save </button>
		</div>
	{:else}
		<button type="button" on:click={cancel}>cancel</button>
	{/if}
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
	<textarea
		placeholder="> value"
		bind:this={rawSerializedEl}
		bind:value={rawSerialized}
		use:autofocus
		disabled={pending}
		on:keydown={onKeydown}
	/>
	<textarea
		placeholder="> transformed"
		bind:value={rawTransformed}
		disabled={pending}
		on:keydown={onKeydown}
	/>
	{#if changed}
		<div class="preview markup panel-outset">
			<!-- TODO needs better error reporting -->
			{#if previewTransformed !== undefined}<pre>{previewTransformed}</pre>{:else}<em
					>(parse failed)</em
				>{/if}
		</div>
		<div class="preview markup panel-outset">
			<p>
				{#if rawSerialized}<pre>{previewSerialized}</pre>{:else}<em>(empty)</em>{/if}
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
