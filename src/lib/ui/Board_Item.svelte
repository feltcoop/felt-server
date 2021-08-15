<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {Post} from '$lib/posts/post.js';
	import type {Member} from '$lib/members/member.js';
	import Actor_Icon from '$lib/ui/Actor_Icon.svelte';
	import {random_hue} from '$lib/ui/color';

	export let post: Post;
	export let member: Member; // TODO should this be `Actor`?

	// TODO shouldn't need this
	$: icon = (member as any).icon || null;

	// TODO refactor to some client view-model for the actor
	$: hue = random_hue(member.name);
</script>

<li style="--hue: {hue}">
	<Markup>
		<p>
			{post.content}
		</p>
	</Markup>
	<div class="about">
		<Actor_Icon name={member.name} {icon} />
		<span class="actor">{member.name}</span>
	</div>
</li>

<style>
	li {
		padding: var(--spacing_xs);
		/* TODO experiment with a border color instead of bg */
		background-color: hsl(var(--hue), var(--bg_saturation), calc(var(--bg_color_lightness)));
		flex-direction: column;
	}

	.actor {
		padding-left: var(--spacing_md);
		font-weight: var(--font_weight_4);
	}

	.about {
		display: flex;
		align-items: center;
	}
</style>
