<script lang="ts">
	import {session} from '$app/stores';

	import type {ClientAccount} from '$lib/session/clientSession.js';
	import WaitingAnimation from '$lib/ui/Waiting_Animation.svelte';

	let account: ClientAccount;
	$: account = $session?.account;
	$: console.log('<LogoutForm> account', account);

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting || !account;

	const submitName = async () => {
		submitting = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/v1/logout', {
				method: 'POST',
				headers: {'content-type': 'application/json'},
			});
			const responseData = await response.json();
			console.log('responseData', responseData); // TODO logging
			if (response.ok) {
				errorMessage = '';
				$session = {guest: true};
			} else {
				console.error('error response', response); // TODO logging
				errorMessage = responseData.reason;
			}
		} catch (err) {
			console.error('err', err); // TODO logging
			errorMessage = `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again!`;
		} finally {
			submitting = false;
		}
	};
</script>

<!-- TODO well this is weird -->
{#if account && !$session.guest}
	{account.name}
{/if}
<button type="button" on:click={submitName} {disabled}>
	{#if submitting}
		<WaitingAnimation />
	{:else}log out{/if}
</button>
{#if errorMessage}
	<div>
		<p class="error">{errorMessage}</p>
	</div>
{/if}

<style>
	/*  TODO global classes? */
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
</style>
