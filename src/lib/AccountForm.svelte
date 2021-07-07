<script lang="ts">
	import {session} from '$app/stores';

	import LoginForm from '$lib/LoginForm.svelte';
	import LogoutForm from '$lib/LogoutForm.svelte';

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
