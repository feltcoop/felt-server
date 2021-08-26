<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {autofocus} from '$lib/ui/actions';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	let open = false;
	let new_name = '';

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await api.create_community(new_name);
			new_name = '';
			open = false;
		}
	};
</script>

<!--TODO: Make an IconButton component in felt and use it here-->
<button
	aria-label="Create Community"
	type="button"
	class="button-emoji"
	on:click={() => (open = true)}
>
	➕
</button>
{#if open}
	<Modal close={() => (open = false)}>
		<Markup>
			<h1>Create a new community</h1>
			<p>
				<input
					type="text"
					placeholder="> name"
					on:keydown={on_keydown}
					bind:value={new_name}
					use:autofocus
				/>
			</p>
		</Markup>
	</Modal>
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
