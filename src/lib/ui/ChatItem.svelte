<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {random_hue} from '$lib/ui/color';

	export let file: File;
	export let member: Member; // TODO should this be `Actor`?

	// TODO shouldn't need this
	$: icon = (member as any).icon || null;

	// TODO refactor to some client view-model for the actor
	$: hue = random_hue(member.name);
</script>

<li style="--hue: {hue}">
	<ActorIcon name={member.name} {icon} />
	<div class="content">
		<div>
			<span class="actor">{member.name}</span>
		</div>
		<div>
			{file.content}
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
