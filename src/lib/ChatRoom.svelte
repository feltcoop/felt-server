<script lang="ts">
	import {onMount} from 'svelte';
	import type {Post} from '../posts/post.js';

	export let spaceId: number;
	export let props: Object;

	let posts: Post[];
	posts = [];

	onMount(async () => {
		const res = await fetch(`/api/v1/spaces/${spaceId}/posts`);
		if (res.ok) {
			const data = await res.json();
			posts = data.posts;
			console.log(posts);
		}
	});
</script>

<div class="chatRoom">
	{#each posts as post (post.post_id)}
		<div>{post.actor_id} said: {post.content}</div>
	{/each}
</div>

<style>
</style>
