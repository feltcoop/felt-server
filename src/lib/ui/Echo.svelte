<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';

	let value = 'world';

	let response_data: Record<string, any> | null = null;
	$: console.log('echo response_data', response_data);
	$: serialized_response_data = response_data ? JSON.stringify(response_data, null, 2) : '';

	let fetch_state: AsyncStatus = 'initial';
	let fetch_error: string | null = null;

	// TODO state machine? xstate in another template?
	$: disabled = fetch_state === 'pending';

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
		fetch_error = null;
		response_data = null;
		fetch_state = 'pending';
		try {
			const response = await fetch(request);
			// TODO create activity for the echo response,
			// and have it tied somehow to the initial activity above
			response_data = await response.json();
			fetch_state = 'success';
		} catch (err) {
			fetch_error = err.message;
			fetch_state = 'failure';
		} finally {
			request = null;
		}
	};
</script>

<form on:submit|preventDefault={echo}>
	<input type="text" bind:value />
	<button type="button" on:click={echo} {disabled}>echo</button>
	<div>
		{#if serialized_response_data}
			<code>{serialized_response_data}</code>
		{/if}
		{#if fetch_error}
			<span class="error">{fetch_error}</span>
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
