<script lang="ts">
	import type {Post} from '$lib/posts/post.js';

	export let posts: Post[];
</script>

<ul>
	{#each posts as post (post.post_id)}
		<li>
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
