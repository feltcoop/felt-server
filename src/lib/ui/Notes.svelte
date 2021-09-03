<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {get_app} from '$lib/ui/app';

	const {api, data} = get_app();

	export let space: Space;

	let text = '';

	$: browser && api.load_posts(space.space_id);
	$: console.log(`[Notes] fetching posts for ${space.space_id}`);

	const create_post = async () => {
		if (!text) return;
		await api.create_post(space, text);
		text = '';
	};

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create_post();
		}
	};

	$: posts = $data.posts_by_space[space.space_id] || [];
</script>

<div class="notes">
	<textarea type="text" placeholder="> note" on:keydown={on_keydown} bind:value={text} />
	<div class="posts">
		<NoteItems {posts} />
	</div>
</div>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	textarea {
		border-left: none;
		border-right: none;
		border-top: none;
		border-radius: 0;
	}
	.posts {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
