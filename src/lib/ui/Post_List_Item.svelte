<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';

	export let post: Post;
	export let members_by_id: Map<number, Member>;
</script>

<li>
	<!--TODO: fix the backend datastruct to not need this-->
	<span class="actor">{members_by_id.get(post.actor_id)?.name}</span>
	{post.content}
</li>

<style>
	li {
		padding: var(--spacing_xs);
	}

	li:nth-child(2n + 1) {
		background-color: hsl(var(--bg_hue), var(--bg_saturation), calc(var(--bg_lightness) - 5%));
	}

	.actor {
		font-weight: var(--font_weight_4);
		padding-right: var(--spacing_md);
	}
</style>
