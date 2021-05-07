<script lang="ts">
	import type {Post} from '../posts/post.js';
	import {browser} from '$app/env';
	import type {Space} from '../spaces/space.js';

	export let space: Space;
	$: browser && loadPosts(space.space_id);
	$: console.log(`[chatRoom] fetching posts for ${space.space_id}`);

	let posts: Post[] = [];

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
