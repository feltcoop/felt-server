<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';
	import type {Api} from '$lib/ui/api';

	export let guest: boolean;
	export let logIn: Api['logIn'];
	export let logOut: Api['logOut'];
</script>

{#if guest}
	<LoginForm {logIn} />
{:else}
	<LogoutForm {logOut} />
{/if}
