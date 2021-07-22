<script lang="ts">
	import {session} from '$app/stores';

	import Account_Form from '$lib/ui/Account_Form.svelte';
	import Workspace from '$lib/ui/Workspace.svelte';

	const title = 'felt-server';
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	{#if $session.guest}
		<Account_Form />
	{:else}
		<Workspace />
	{/if}
</main>
