<script lang="ts">
	import type {Post} from '../posts/post.js';
	import {browser} from '$app/env';
	$: browser && loadPosts(spaceId);

	export let spaceId: number;
	export let props: Object;

	$: console.log(`[chatRoom] fetching posts for ${spaceId}`);

	let posts: Post[];
	$: posts = [];

	const loadPosts = async (spaceId: number) => {
		const res = await fetch(`/api/v1/spaces/${spaceId}/posts`);
		if (res.ok) {
			const data = await res.json();
			posts = data.posts;
			console.log(posts);
		}
	};
</script>

<div class="chatRoom">
	{#each posts as post (post.post_id)}
		<div>{post.actor_id} said: {post.content}</div>
	{/each}
</div>

<style>
</style>
