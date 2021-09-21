<script lang="ts">
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

	export let persona: Persona | null; // TODO should this be `Actor`?
	export let showName: boolean = true; // TODO not sure about this

	// TODO factor out a viewmodel or something
	$: name = (persona as any)?.name || GUEST_PERSONA_NAME;
	$: icon = (persona as any)?.icon || null;
	$: hue = randomHue(name); // TODO add custom setting on personas
</script>

<div class="persona-info" style="--hue: {hue}">
	<ActorIcon {name} {icon} />
	{#if showName}
		<span class="actor">{name}</span>
	{/if}
</div>

<style>
	.persona-info {
		display: flex;
		align-items: center;
	}
	.actor {
		padding-left: var(--spacing_md);
		font-weight: var(--font_weight_4);
	}
</style>
