<script lang="ts">
	import type {Async_Status} from '@feltcoop/felt';

	let value = 'world';

	let responseData: Record<string, any> | null = null;
	$: console.log('echo responseData', responseData);
	$: serializedResponseData = responseData ? JSON.stringify(responseData, null, 2) : '';

	let fetchState: Async_Status = 'initial';
	let fetchError: string | null = null;

	// TODO state machine? xstate in another template?
	$: disabled = fetchState === 'pending';

	let request: Request | null = null;

	const echo = async () => {
		if (request) return;
		const body = {value};
		// TODO create activity for the echo action
		request = new Request('/api/v1/echo', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {'content-type': 'application/json'},
		});
		fetchError = null;
		responseData = null;
		fetchState = 'pending';
		try {
			const response = await fetch(request);
			// TODO create activity for the echo response,
			// and have it tied somehow to the initial activity above
			responseData = await response.json();
			fetchState = 'success';
		} catch (err) {
			fetchError = err.message;
			fetchState = 'failure';
		} finally {
			request = null;
		}
	};
</script>

<form on:submit|preventDefault={echo}>
	<input type="text" bind:value />
	<button type="button" on:click={echo} {disabled}>echo</button>
	<div>
		{#if serializedResponseData}
			<code>{serializedResponseData}</code>
		{/if}
		{#if fetchError}
			<span class="error">{fetchError}</span>
		{/if}
	</div>
</form>

<style>
	.error {
		color: red;
	}
	code {
		background-color: #eee;
	}
</style>
