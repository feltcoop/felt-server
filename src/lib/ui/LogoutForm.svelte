<script lang="ts">
	import {session} from '$app/stores';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';

	let account: AccountModel;
	$: account = $session?.account;
	$: console.log('<LogoutForm> account', account);

	let error_message: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting || !account;

	const submit_name = async () => {
		submitting = true;
		error_message = '';
		try {
			const response = await fetch('/api/v1/logout', {
				method: 'POST',
				headers: {'content-type': 'application/json'},
			});
			const response_data = await response.json();
			console.log('response_data', response_data); // TODO logging
			if (response.ok) {
				error_message = '';
				$session = {guest: true};
			} else {
				console.error('error response', response); // TODO logging
				error_message = response_data.reason;
			}
		} catch (err) {
			console.error('err', err); // TODO logging
			error_message = `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again!`;
		} finally {
			submitting = false;
		}
	};
</script>

<form>
	<button type="button" on:click={submit_name} {disabled}>
		{#if submitting}
			<PendingAnimation />
		{:else}log out{/if}
	</button>
	{#if error_message}
		<div>
			<p class="error">{error_message}</p>
		</div>
	{/if}
</form>

<style>
	/*  TODO global classes? */
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
</style>
