<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import Echo from '$lib/Echo.svelte';
	import AccountForm from '$lib/AccountForm.svelte';

	const title = 'felt-server';
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
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
