<script lang="ts">
	import {session} from '$app/stores.js';
	import {tick} from 'svelte';

	import type {LoginRequest} from '../session/loginMiddleware.js';
	import WaitingAnimation from './WaitingAnimation.svelte';

	let username = '';
	let password = '';
	let usernameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting;

	const submitName = async () => {
		if (!username) {
			usernameEl.focus();
			errorMessage = 'please enter a username';
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
		console.log('logging in with username', username);
		try {
			const loginRequest: LoginRequest = {username, password};
			const response = await fetch('/api/v1/login', {
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(loginRequest),
			});
			const responseData = await response.json();
			submitting = false;
			if (response.ok) {
				console.log('responseData', responseData); // TODO logging
				username = '';
				errorMessage = '';
				if (responseData.session) {
					$session = responseData.session;
					location.reload();
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
	bind:this={usernameEl}
	bind:value={username}
	on:keypress={onKeyPress}
	{disabled}
	placeholder="username"
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
