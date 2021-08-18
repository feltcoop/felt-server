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
		border: var(--border);
		max-width: var(--column_width_min);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg_color);
	}
</style>
