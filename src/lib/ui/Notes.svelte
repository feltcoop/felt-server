<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/spaces/space.js';
	import Note_List from '$lib/ui/Note_List.svelte';
	import {posts} from '$lib/ui/post_store';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let space: Space;

	let text = '';

	$: browser && load_posts(space.space_id);
	$: console.log(`[Notes] fetching posts for ${space.space_id}`);

	// TODO refactor
	const load_posts = async (space_id: number) => {
		const res = await fetch(`/api/v1/spaces/${space_id}/posts`);
		if (res.ok) {
			const data = await res.json();
			posts.set(data.posts);
		}
	};

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
</script>

<div class="notes">
	<textarea type="text" placeholder="> note" on:keydown={on_keydown} bind:value={text} />
	<div class="posts">
		<Note_List posts={$posts} />
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
