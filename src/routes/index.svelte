<script lang="ts">
	import {session} from '$app/stores';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import Account_Form from '$lib/ui/Account_Form.svelte';
	import Workspace from '$lib/ui/Workspace.svelte';

	const title = 'felt-server';
</script>

<svelte:head><title>{title}</title></svelte:head>

<main>
	{#if $session.guest}
		<div class="column">
			<Markup>
				<Account_Form />
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
