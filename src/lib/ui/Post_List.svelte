<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import Post_List_Item from '$lib/ui/Post_List_Item.svelte';

	export let posts: Post[];
	export let members_by_id: Map<number, Member>;

	// TODO refactor
	const to_member = (actor_id: number): Member => {
		const member = members_by_id.get(actor_id);
		if (!member) throw Error(`Unknown actor ${actor_id}`);
		return member;
	};
</script>

<ul>
	{#each posts as post (post.post_id)}
		<Post_List_Item {post} member={to_member(post.actor_id)} />
	{/each}
</ul>
