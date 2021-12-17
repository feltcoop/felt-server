<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import type {Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';

	const {dispatch} = getApp();

	export let space: Readable<Space>;

	let opened = false;
	let errorMessage: string | undefined;

	const deleteSpace = async () => {
		errorMessage = '';
		const result = await dispatch('delete_space', {
			space_id: $space.space_id,
		});
		if (result.ok) {
			opened = false;
		} else {
			errorMessage = result.reason;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await deleteSpace();
		}
	};
</script>

<button
	aria-label="Delete Space"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	🗑️
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
		<div class="markup">
			<h1>Delete {$space.name} space?</h1>
			<form>
				<div class:error={!!errorMessage}>{errorMessage || ''}</div>
				<button type="button" on:click={deleteSpace} on:keydown={onKeydown}> Delete space </button>
			</form>
		</div>
	</Dialog>
{/if}

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
