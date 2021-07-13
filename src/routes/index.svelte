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
	<h1>{title}</h1>
	<section>
		<Account_Form />
	</section>
	{#if communities}
		<Workspace {friends} {communities} />
	{/if}
</main>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
	}

	main {
		text-align: center;
		padding: 0 auto;
	}

	h1 {
		color: #ff3e00;
		font-size: 4rem;
		font-weight: 100;
		line-height: 1.1;
		max-width: 14rem;
	}

	section {
		padding: 30px 10px;
	}

	@media (min-width: 480px) {
		h1 {
			max-width: none;
		}
	}
</style>
