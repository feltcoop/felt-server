<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import Note_List_Item from '$lib/ui/Note_List_Item.svelte';

	export let posts: Post[];

	$: notes = posts.slice().reverse(); // TODO definitely not this
</script>

<ul>
	{#each notes as post (post.post_id)}
		<Note_List_Item {post} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
