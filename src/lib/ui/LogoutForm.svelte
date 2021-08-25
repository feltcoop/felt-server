<script lang="ts">
	import {session} from '$app/stores';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	let account: AccountModel;
	$: account = $session?.account;
	$: console.log('<LogoutForm> account', account);

	let error_message: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = submitting || !account;

	const log_out = async () => {
		submitting = true;
		error_message = '';
		const result = await api.log_out();
		console.log('<LogoutForm> log_out result', result);
		if (!result.ok) {
			error_message = result.reason;
		}
		submitting = false;
	};
</script>

<form>
	<!-- TODO extract an `AsyncButton` or something that correctly sizes the overlay -->
	<button type="button" on:click={log_out} {disabled}>
		{#if submitting}
			<PendingAnimation />
		{:else}log out{/if}
	</button>
	{#if error_message}
		<Message status="error">{error_message}</Message>
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
</style>
