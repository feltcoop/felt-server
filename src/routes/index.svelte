<script lang="ts">
	import {session} from '$app/stores.js';
	import AccountForm from '$lib/AccountForm.svelte';
	import Workspace from '$lib/Workspace.svelte';
	import type {ClientAccount} from 'src/session/clientSession.js';
	import type {Community} from 'src/communities/community.js';

	const title = 'felt-server';
	let account: ClientAccount;
	$: account = $session?.account;
	let communities: Community[] = [];
	$: communities = $session?.communities;
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	{#if communities}
		<Workspace {communities} />
	{/if}
	<h1>{title}</h1>
	<section>
		<AccountForm />
	</section>
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
