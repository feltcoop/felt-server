<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';
	import type {ApiStore} from '$lib/ui/api';

	export let guest: boolean;
	export let logIn: ApiStore['logIn'];
	export let logOut: ApiStore['logOut'];
</script>

{#if guest}
	<LoginForm {logIn} />
{:else}
	<LogoutForm {logOut} />
{/if}
