<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';

	export let posts: Post[];
	export let members: Member[];
</script>

<ul>
	{#each posts as post (post.post_id)}
		<li>
			<small>{members.find((member) => member.account_id == post.actor_id)?.name}</small>:
			{post.content}
		</li>
	{/each}
</ul>
