<script lang="ts">
	import Modal from '$lib/ui/Modal.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {autofocus} from '$lib/ui/actions';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await api.create_community(new_name);
			new_name = '';
			close_modal();
		}
	};
</script>

<!--TODO: Make an Icon_Button component in felt and use it here-->
<Modal>
	<div slot="trigger" let:open>
		<button
			aria-label="Create Community"
			type="button"
			class="button-emoji"
			on:click={() => open()}
		>
			➕
		</button>
	</div>
	<div slot="content" let:close>
		<Markup>
			<h1>Create a new community</h1>
			<p>
				<input
					type="text"
					placeholder="> name"
					on:keydown={(e) => on_keydown(e, close)}
					bind:value={new_name}
					use:autofocus
				/>
			</p>
		</Markup>
	</div>
</Modal>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
