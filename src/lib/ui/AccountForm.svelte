<script lang="ts">
	import LoginForm from '$lib/ui/LoginForm.svelte';
	import LogoutForm from '$lib/ui/LogoutForm.svelte';
	import type {ApiStore} from '$lib/ui/api';

	export let guest: boolean;
	export let log_in: ApiStore['log_in'];
	export let log_out: ApiStore['log_out'];
</script>

{#if guest}
	<LoginForm {log_in} />
{:else}
	<LogoutForm {log_out} />
{/if}
