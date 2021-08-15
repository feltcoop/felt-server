<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import Notes_Item from '$lib/ui/Notes_Item.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let posts: Post[];

	$: notes = posts.slice().reverse(); // TODO definitely not this
</script>

<ul>
	{#each notes as post (post.post_id)}
		<Notes_Item {post} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
