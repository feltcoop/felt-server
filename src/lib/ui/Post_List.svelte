<script lang="ts">
	import type {Post} from '$lib/posts/post.js';

	export let posts: Post[];
</script>

<ul>
	{#each posts as post (post.post_id)}
		<li>
			<!--TODO: fix the backend datastruct to not need this-->
			<small>{post.name}</small>:
			{post.content}
		</li>
	{/each}
</ul>

<style>
	li {
		color: black;
	}
</style>
