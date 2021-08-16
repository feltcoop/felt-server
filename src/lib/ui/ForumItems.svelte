<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import ForumItem from '$lib/ui/ForumItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

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
		<ForumItem {post} member={to_member(post.actor_id)} />
	{/each}
</ul>
