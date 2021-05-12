<script lang="ts">
	import type {Post} from '../posts/post.js';
	import {browser} from '$app/env';
	import type {Space} from '../spaces/space.js';

	export let space: Space;
	export let text = '';
	$: browser && loadPosts(space.space_id);
	$: console.log(`[chatRoom] fetching posts for ${space.space_id}`);

	let posts: Post[] = [];

	const loadPosts = async (spaceId: number) => {
		const res = await fetch(`/api/v1/spaces/${spaceId}/posts`);
		if (res.ok) {
			const data = await res.json();
			posts = data.posts;
		}
	};

	const createPost = async () => {
		if (!text) return;
		const res = await fetch(`/api/v1/spaces/${space.space_id}/posts`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({content: text}),
		});
		if (res.ok) {
			console.log('post sent');
		} else {
			console.error('error sending post');
		}
		text = '';
	};

	const onKeyDown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createPost();
			await loadPosts(space.space_id);
		}
	};
</script>

<div class="chatRoom">
	{#each posts as post (post.post_id)}
		<div>{post.actor_id} said: {post.content}</div>
	{/each}
	<input type="text" placeholder="> chat" on:keydown={onKeyDown} bind:value={text} />
</div>

<style>
	.chatRoom {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
