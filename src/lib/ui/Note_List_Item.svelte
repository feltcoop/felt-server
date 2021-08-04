<script lang="ts">
	import type {Post} from '$lib/posts/post.js';

	export let post: Post;
</script>

<li>
	{post.content}
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border-bottom: var(--border);
	}
</style>
