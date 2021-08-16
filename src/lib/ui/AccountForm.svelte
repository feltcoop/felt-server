<script lang="ts">
	import {session} from '$app/stores';

	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';

	$: console.log('<AccountForm> $session', $session);
</script>

{#if $session.guest}
	<LoginForm />
{:else}
	<LogoutForm />
{/if}
