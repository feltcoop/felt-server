<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import Post_List_Item from '$lib/ui/Post_List_Item.svelte';

	export let posts: Post[];
	export let members_by_id: Map<number, Member>;
</script>

<ul>
	{#each posts as post (post.post_id)}
		<Post_List_Item {post} {members_by_id} />
	{/each}
</ul>
