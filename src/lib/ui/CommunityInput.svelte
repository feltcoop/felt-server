<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {
		api,
		ui: {selectedPersonaId},
	} = getApp();

	let opened = false;
	let name = '';

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await api.createCommunity({name, persona_id: $selectedPersonaId!}); // TODO generic erorr check for no selected persona?
			name = '';
			opened = false;
		}
	};
</script>

<!--TODO: Make an IconButton component in felt and use it here-->
<button
	aria-label="Create Community"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	➕
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
		<Markup>
			<h1>Create a new community</h1>
			<p>
				<input
					type="text"
					placeholder="> name"
					on:keydown={onKeydown}
					bind:value={name}
					use:autofocus
				/>
			</p>
		</Markup>
	</Dialog>
{/if}

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
