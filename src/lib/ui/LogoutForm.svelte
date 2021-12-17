<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {selectedPersona},
	} = getApp();

	let account: AccountModel | undefined;
	$: account = $session.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	$: selectedPersonaValue = $selectedPersona;

	const doLogOut = async () => {
		submitting = true;
		errorMessage = '';
		const result = await dispatch('LogOut');
		console.log('<LogoutForm> LogOut result', result);
		if (!result.ok) {
			errorMessage = result.reason;
		}
		submitting = false;
	};
</script>

{#if account}
	<div>This account was created {account.created}</div>
{/if}
{#if selectedPersonaValue}
	<div>This persona was created {$selectedPersonaValue.created}</div>
{/if}
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
