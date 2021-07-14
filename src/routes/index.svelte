<script lang="ts">
	import {session} from '$app/stores';

	import Account_Form from '$lib/ui/Account_Form.svelte';
	import Workspace from '$lib/ui/Workspace.svelte';
	import type {Client_Account} from '$lib/session/client_session.js';

	const title = 'felt-server';
	let account: Client_Account;
	$: account = $session?.account;
	$: console.log('<index> $session', $session);
	$: console.log('<index> account', account);
	$: communities = $session?.communities;
	$: friends = $session?.friends;
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	<section>
		<Account_Form />
	</section>
	{#if communities}
		<Workspace {friends} {communities} />
	{/if}
</main>
