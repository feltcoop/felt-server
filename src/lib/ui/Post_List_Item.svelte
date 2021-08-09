<script lang="ts">
	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import Actor_Icon from '$lib/ui/Actor_Icon.svelte';
	import {to_random_seeded} from '@feltcoop/felt/util/random_seeded.js';

	export let post: Post;
	export let member: Member; // TODO should this be `Actor`?

	// TODO shouldn't need this
	$: icon = (member as any).icon || null;

	// TODO refactor to some client view-model for the actor
	$: hue = to_random_seeded(member.name)() * 360; // TODO random int
</script>

<li style="--hue: {hue}">
	<Actor_Icon name={member.name} {icon} />
	<div class="content">
		<div>
			<span class="actor">{member.name}</span>
		</div>
		<div>
			{post.content}
		</div>
	</div>
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
	}

	.actor {
		font-weight: var(--font_weight_4);
	}

	.content {
		padding-left: var(--spacing_sm);
	}
</style>
