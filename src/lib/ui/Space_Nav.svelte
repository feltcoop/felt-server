<script lang="ts">
	import type {Result} from '@feltcoop/felt';

	import type {Space} from '$lib/spaces/space.js';
	import Modal from '$lib/ui/Modal.svelte';
	import type {Community} from '$lib/communities/community.js';

	export let community: Community;
	export let spaces: Space[];
	export let selected_space: Space;
	export let select_space: (community: Space) => void;
	export let create_space: (
		url: string,
		media_type: string,
		content: string,
	) => Promise<Result<{value: {space: Space}}, {reason: string}>>;

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await create();
			close_modal();
		}
	};

	const create = async () => {
		if (!new_name) return;
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		const url = `/${new_name}`;
		await create_space(
			url,
			'application/json',
			`{"type": "ChatRoom", "props": {"data": "${url}/posts"}}`,
		);
		new_name = '';
	};
</script>

<div class="space-nav">
	<div class="header">
		<Modal let:open={open_modal} let:close={close_modal}>
			<span slot="trigger">
				<button
					aria-label="Create Space"
					type="button"
					class="button-emoji"
					on:click={() => open_modal()}>➕</button
				>
			</span>
			<div slot="header">
				<h1>Create a new space</h1>
			</div>

			<div slot="content">
				<p>
					<input
						type="text"
						placeholder="> chat"
						on:keydown={(e) => on_keydown(e, close_modal)}
						bind:value={new_name}
					/>
				</p>
			</div>
		</Modal>
	</div>
	{#each spaces as space (space.space_id)}
		<button
			class:selected={space === selected_space}
			disabled={space === selected_space}
			on:click={() => select_space(space)}>{space.url}</button
		>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		width: 15rem;
		border-top: var(--border);
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}

	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
