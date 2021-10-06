<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
	} = getApp();

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let inputEl: HTMLInputElement;

	// TODO add initial hue!

	const create = async () => {
		if (!name) {
			inputEl.focus();
			return;
		}
		status = 'pending';
		await dispatch('create_persona', {name});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		name = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<Markup>
	<h2>Create a persona</h2>
	<form>
		<input
			placeholder="> name"
			bind:this={inputEl}
			bind:value={name}
			use:autofocus
			disabled={status === 'pending'}
			on:keydown={onKeydown}
		/>
		<button type="button" on:click={create} disabled={status === 'pending'}>
			Create persona
		</button>
	</form>
</Markup>
<div class="centered-block">
	<div>
		<Message icon="‼">your persona name is visible to others</Message>
	</div>
</div>

<style>
	h2 {
		text-align: center;
	}

	.centered-block {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
