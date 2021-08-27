<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import type {ApiStore} from '$lib/ui/api';

	export let log_out: ApiStore['log_out'];

	let account: AccountModel;
	$: account = $session?.account;
	$: console.log('<LogoutForm> account', account);

	let error_message: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const do_log_out = async () => {
		submitting = true;
		error_message = '';
		const result = await log_out();
		console.log('<LogoutForm> log_out result', result);
		if (!result.ok) {
			error_message = result.reason;
		}
		submitting = false;
	};
</script>

<form>
	<PendingButton pending={!!submitting} type="button" on:click={do_log_out} {disabled}>
		log out
	</PendingButton>
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
