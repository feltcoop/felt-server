<script lang="ts">
	import {session} from '$app/stores';
	import Pending_Animation from '@feltcoop/felt/ui/Pending_Animation.svelte';

	import type {Client_Account} from '$lib/session/client_session.js';

	let account: Client_Account;
	$: account = $session?.account;
	$: console.log('<Logout_Form> account', account);

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

<!-- TODO well this is weird -->
{#if account && !$session.guest}
	{account.name}
{/if}
<button type="button" on:click={submit_name} {disabled}>
	{#if submitting}
		<Pending_Animation />
	{:else}log out{/if}
</button>
{#if error_message}
	<div>
		<p class="error">{error_message}</p>
	</div>
{/if}

<style>
	/*  TODO global classes? */
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
</style>
