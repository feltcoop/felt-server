<script lang="ts">
	import {session} from '$app/stores';

	import LoginForm from '$lib/ui/Login_Form.svelte';
	import LogoutForm from '$lib/ui/Logout_Form.svelte';

	$: console.log('<AccountForm> $session', $session);
</script>

<form>
	{#if $session.guest}
		<LoginForm />
	{:else}
		<LogoutForm />
	{/if}
</form>

<style>
	/* TODO global form styling? */
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
