<script lang="ts">
	import {session} from '$app/stores';
	import {tick} from 'svelte';
	import Pending_Animation from '@feltcoop/felt/ui/Pending_Animation.svelte';

	import type {Login_Request} from '$lib/session/login_middleware.js';
	import {autofocus} from '$lib/ui/actions';

	let account_name = '';
	let password = '';
	let account_name_el: HTMLInputElement;
	let password_el: HTMLInputElement;
	let button_el: HTMLButtonElement;
	let error_message: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting;

	const submit_name = async () => {
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
		try {
			const login_request: Login_Request = {account_name, password};
			const response = await fetch('/api/v1/login', {
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(login_request),
			});
			const response_data = await response.json();
			submitting = false;
			if (response.ok) {
				console.log('response_data', response_data); // TODO logging
				account_name = '';
				error_message = '';
				if (response_data.session) {
					$session = response_data.session;
				}
			} else {
				console.error('response not ok', response); // TODO logging
				error_message = response_data.reason;
				await tick();
				password_el.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
			}
		} catch (err) {
			submitting = false;
			console.error('error logging in', err); // TODO logging
			error_message = `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again.`;
		}
	};

	const on_keypress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			submit_name();
		}
	};
</script>

<div class="login-wrapper">
	<img src="/favicon.png" alt="felt heart" />
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
		<button type="button" bind:this={button_el} on:click={submit_name} {disabled}>
			{#if submitting}
				<Pending_Animation />
			{:else}log in{/if}
		</button>
		{#if error_message}
			<div class="error">{error_message}</div>
		{/if}
	</form>
</div>

<style>
	.login-wrapper {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
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
</style>
