<script lang="ts">
	import {session} from '$app/stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {AccountModel} from '$lib/vocab/account/account';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	let account: AccountModel | undefined;
	$: account = $session.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const logout = async () => {
		submitting = true;
		errorMessage = '';
		const result = await dispatch('LogoutAccount');
		if (!result.ok) {
			errorMessage = result.message;
		}
		submitting = false;
	};
</script>

<form>
	<PendingButton pending={!!submitting} type="button" on:click={logout} {disabled}>
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
