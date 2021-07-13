<script lang="ts">
	import {session} from '$app/stores';

	import Login_Form from '$lib/ui/Login_Form.svelte';
	import Logout_Form from '$lib/ui/Logout_Form.svelte';

	$: console.log('<Account_Form> $session', $session);
</script>

<form>
	{#if $session.guest}
		<Login_Form />
	{:else}
		<Logout_Form />
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
