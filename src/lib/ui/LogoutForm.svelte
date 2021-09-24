<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import type {Api} from '$lib/ui/api';

	export let logOut: Api['logOut'];

	let account: AccountModel;
	$: account = $session?.account;
	$: console.log('<LogoutForm> account', account);

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const doLogOut = async () => {
		submitting = true;
		errorMessage = '';
		const result = await logOut();
		console.log('<LogoutForm> logOut result', result);
		if (!result.ok) {
			errorMessage = result.reason;
		}
		submitting = false;
	};
</script>

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
