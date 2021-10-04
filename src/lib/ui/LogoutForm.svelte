<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
	} = getApp();

	let account: AccountModel;
	$: account = $session?.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const doLogOut = async () => {
		submitting = true;
		errorMessage = '';
		const result = await dispatch('log_out');
		console.log('<LogoutForm> log_out result', result);
		if (!result.ok) {
			errorMessage = result.reason;
		}
		submitting = false;
	};
</script>

<div>This account was created {account.created}</div>
<form>
	<PendingButton pending={!!submitting} type="button" on:click={doLogOut} {disabled}>
		log out
	</PendingButton>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
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
