<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';
	import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';

	export let guest: boolean;
</script>

{#if guest}
	<LoginForm />
{:else}
	<ManageMembershipForm />
	<LogoutForm />
{/if}
