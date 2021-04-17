<script lang="ts">
	import {session} from '$app/stores.js';
	import Counter from '$lib/Counter.svelte';
	import Echo from '$lib/Echo.svelte';
	import AccountForm from '$lib/AccountForm.svelte';
	import SideNav from '$lib/SideNav.svelte';
	import {onMount} from 'svelte';
	import type {ClientSession} from 'src/session/clientSession.js';
	import type {Community} from 'src/communities/community.js';

	const title = 'felt-server';
	let user: ClientSession;
	$: user = $session?.user;
	let communities: Community[] = [];

	onMount(async () => {
		const res = await fetch(`/api/v1/communities`);
		if (res.ok) {
			const data = await res.json();
			communities = data.communities;
			console.log(communities);
		}
	});
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	{#if user && !user.guest}
		<SideNav {communities} />
	{/if}
	<h1>{title}</h1>
	<section>
		<Counter />
	</section>
	<section>
		<Echo />
	</section>
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
		padding: 1em;
		margin: 0 auto;
		padding: 0 auto;
	}

	h1 {
		color: #ff3e00;
		font-size: 4rem;
		font-weight: 100;
		line-height: 1.1;
		margin: 4rem auto;
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
