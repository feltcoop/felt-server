<script lang="ts">
	import {session} from '$app/stores';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import AccountForm from '$lib/ui/AccountForm.svelte';
	import Workspace from '$lib/ui/Workspace.svelte';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	const title = 'felt-server';
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	{#if $session.guest}
		<div class="column">
			<Markup>
				<AccountForm guest={$session.guest} log_in={api.log_in} log_out={api.log_out} />
			</Markup>
		</div>
	{:else}
		<Workspace />
	{/if}
</main>

<style>
	main {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
</style>
