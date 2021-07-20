<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';

	export let posts: Post[];
	export let members_by_id: Map<number, Member>;
</script>

<ul>
	{#each posts as post (post.post_id)}
		<li>
			<!--TODO: fix the backend datastruct to not need this-->
			<small>{members_by_id.get(post.actor_id)?.name}</small>:
			{post.content}
		</li>
	{/each}
</ul>
