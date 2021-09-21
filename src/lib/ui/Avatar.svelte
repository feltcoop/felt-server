<script lang="ts">
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

	export let name: string = GUEST_PERSONA_NAME; // TODO should this handle "default" or "empty" or "blank" avatars?
	export let icon: string | null = null;
	export let showName: boolean = true;
	export let showIcon: boolean = true;
</script>

<!-- TODO add link option? -->

<div class="avatar" style="--hue: {randomHue(name)}">
	{#if showIcon}
		<ActorIcon {name} {icon} />
	{/if}
	{#if showName}
		<span class="actor">{name}</span>
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		align-items: center;
	}
	.actor {
		padding-left: var(--spacing_md);
		font-weight: var(--font_weight_4);
	}
</style>
