<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {LogoutResponseResult} from '$lib/app/eventTypes';

	import type {AccountModel} from '$lib/vocab/account/account';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	let account: AccountModel | undefined;
	$: account = $session.guest ? undefined : $session.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const logout = async (): Promise<LogoutResponseResult> => {
		submitting = true;
		errorMessage = '';
		const result = await dispatch.Logout();
		if (!result.ok) {
			errorMessage = result.message;
		}
		submitting = false;
		return result;
	};
</script>

<form>
	<PendingButton pending={!!submitting} on:click={logout} {disabled}>log out</PendingButton>
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
