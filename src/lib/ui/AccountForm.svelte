<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	export let guest: boolean;
</script>

{#if guest}
	<LoginForm />
{:else}
	<button type="button" on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}>
		Manage Memberships
	</button>
	<LogoutForm />
{/if}
