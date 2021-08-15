<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import Chat_Item from '$lib/ui/Chat_Item.svelte';

	export let posts: Post[];
	export let members_by_id: Map<number, Member>;

	// TODO refactor
	const to_member = (actor_id: number): Member => {
		const member = members_by_id.get(actor_id);
		if (!member) throw Error(`Unknown actor ${actor_id}`);
		return member;
	};
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each posts as post (post.post_id)}
		<Chat_Item {post} member={to_member(post.actor_id)} />
	{/each}
</ul>
