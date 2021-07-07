<script lang="ts">
	import {session} from '$app/stores';
	import {tick} from 'svelte';

	import type {LoginRequest} from '$lib/session/loginMiddleware.js';
	import WaitingAnimation from '$lib/WaitingAnimation.svelte';

	let accountName = '';
	let password = '';
	let accountNameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting;

	const submitName = async () => {
		if (!accountName) {
			accountNameEl.focus();
			errorMessage = 'please enter an account name';
			return;
		}
		if (!password) {
			passwordEl.focus();
			errorMessage = 'please enter a password';
			return;
		}
		buttonEl.focus();
		submitting = true;
		errorMessage = '';
		console.log('logging in with accountName', accountName);
		try {
			const loginRequest: LoginRequest = {accountName, password};
			const response = await fetch('/api/v1/login', {
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(loginRequest),
			});
			const responseData = await response.json();
			submitting = false;
			if (response.ok) {
				console.log('responseData', responseData); // TODO logging
				accountName = '';
				errorMessage = '';
				if (responseData.session) {
					$session = responseData.session;
				}
			} else {
				console.error('response not ok', response); // TODO logging
				errorMessage = responseData.reason;
				await tick();
				passwordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
			}
		} catch (err) {
			submitting = false;
			console.error('error logging in', err); // TODO logging
			errorMessage = `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again.`;
		}
	};

	const onKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			submitName();
		}
	};
</script>

<input
	type="text"
	bind:this={accountNameEl}
	bind:value={accountName}
	on:keypress={onKeyPress}
	{disabled}
	placeholder="account name"
/>
<input
	type="password"
	bind:this={passwordEl}
	bind:value={password}
	on:keypress={onKeyPress}
	{disabled}
	placeholder="password"
/>
<button type="button" bind:this={buttonEl} on:click={submitName} {disabled}>
	{#if submitting}
		<WaitingAnimation />
	{:else}log in{/if}
</button>
{#if errorMessage}
	<div class="error">{errorMessage}</div>
{/if}

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
</style>
