<script lang="ts">
	import {tick} from 'svelte';
	import {icons} from '@feltcoop/felt';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import type {ApiStore} from '$lib/ui/api';

	export let log_in: ApiStore['log_in'];

	let account_name = '';
	let password = '';
	let account_name_el: HTMLInputElement;
	let password_el: HTMLInputElement;
	let button_el: HTMLButtonElement;
	let error_message: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting;

	const do_log_in = async () => {
		if (submitting) return;
		if (!account_name) {
			account_name_el.focus();
			error_message = 'please enter an account name';
			return;
		}
		if (!password) {
			password_el.focus();
			error_message = 'please enter a password';
			return;
		}
		button_el.focus();
		submitting = true;
		error_message = '';
		console.log('logging in with account_name', account_name);
		const result = await log_in(account_name, password);
		submitting = false;
		if (!result.ok) {
			error_message = result.reason;
			await tick();
			password_el.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const on_keypress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			do_log_in();
		}
	};
</script>

<div class="icon">
	<img src="/favicon.png" alt="felt heart" />
</div>
<form>
	<input
		type="text"
		bind:this={account_name_el}
		bind:value={account_name}
		on:keypress={on_keypress}
		{disabled}
		placeholder="account name"
		use:autofocus
	/>
	<input
		type="password"
		bind:this={password_el}
		bind:value={password}
		on:keypress={on_keypress}
		{disabled}
		placeholder="password"
	/>
	<PendingButton pending={!!submitting} bind:el={button_el} type="button" on:click={do_log_in}>
		log in
	</PendingButton>
	<div class:error={!!error_message}>{error_message || icons.felt}</div>
</form>

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.icon {
		display: flex;
		justify-content: center;
		padding: var(--spacing_lg);
	}
	.icon img {
		width: var(--icon_size_md);
		height: var(--icon_size_md);
	}
</style>
