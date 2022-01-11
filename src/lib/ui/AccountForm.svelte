<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';

	export let guest: boolean;
</script>

{#if guest}
	<LoginForm />
{:else}
	<LogoutForm />
{/if}
