<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';
	import Post_List from '$lib/ui/Post_List.svelte';
	import {posts} from '$lib/ui/post_store';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let space: Space;
	export let members_by_id: Map<number, Member>;

	let text = '';

	$: browser && load_posts(space.space_id);
	$: console.log(`[Chat] fetching posts for ${space.space_id}`);

	// TODO refactor
	const load_posts = async (space_id: number) => {
		const res = await fetch(`/api/v1/spaces/${space_id}/posts`);
		if (res.ok) {
			const data = await res.json();
			$posts = data.posts;
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

<div class="chat-room">
	<div class="posts">
		<Post_List posts={$posts} {members_by_id} />
	</div>
	<input type="text" placeholder="> chat" on:keydown={on_keydown} bind:value={text} />
</div>

<style>
	.chat-room {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.posts {
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
	input {
		border-left: none;
		border-right: none;
		border-bottom: none;
		border-radius: 0;
	}
</style>
