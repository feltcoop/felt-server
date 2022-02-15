<script lang="ts">
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import type {EntityType} from '$lib/vocab/entity/entity.schema';

	export let name: string = GUEST_PERSONA_NAME; // TODO should this handle "default" or "empty" or "blank" avatars?
	export let icon: string | null = null;
	export let showName = true;
	export let showIcon = true;
	export let type: EntityType = 'Persona';
</script>

<!-- TODO add link option? -->

<div class="avatar" style="--hue: {randomHue(name)}">
	{#if showIcon}
		<EntityIcon {name} {icon} {type} />
	{/if}
	{#if showName}
		<span class="actor" class:has-icon={showIcon}>{name}</span>
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		align-items: center;
	}
	.actor {
		font-weight: var(--font_weight_4);
	}
	.has-icon {
		padding-left: var(--spacing_sm);
	}
</style>
