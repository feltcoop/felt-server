<script lang="ts">
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let personas: Persona[];
	export let selectedPersona: Persona | null;
	export let selectedCommunity: CommunityModel | null;
	export let communitiesByPersonaId: {
		[persona_id: number]: CommunityModel[];
	};
	// TODO this is causing a double state change (rendering an invalid in between state)
	// because it's both navigating and setting state internally in the same user action
	// TODO should this be an event?
	export let selectPersona: (persona_id: number) => void;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	<div>
		{#each personas as persona (persona.persona_id)}
			<a
				class="persona"
				href="/{persona.name}"
				class:selected={persona === selectedPersona}
				style="--hue: {randomHue(persona.name)}"
				on:click={() => selectPersona(persona.persona_id)}
			>
				<ActorIcon name={persona.name} />
			</a>
			{#each communitiesByPersonaId[persona.persona_id] as community (community.community_id)}
				{#if community.name !== persona.name}
					<a
						class="community"
						href="/{community.name}"
						class:selected={persona === selectedPersona && community === selectedCommunity}
						style="--hue: {randomHue(community.name)}"
						on:click={() => selectPersona(persona.persona_id)}
					>
						<ActorIcon name={community.name} />
					</a>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	.community-nav {
		height: 100%;
		border-right: var(--border);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* TODO maybe instead of this, group with elements */
	.persona {
		margin-top: var(--spacing_xl5);
		display: flex;
		justify-content: center;
		align-items: center;
		width: var(--icon_size_md);
		height: var(--icon_size_md);
		--icon_size: var(--icon_size_sm);
	}
	.persona:first-child {
		margin-top: 0;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.header :global(button) {
		width: 100%;
	}

	a {
		display: block;
		/* TODO better way to have active state? this makes the community nav wider than the luggage button! */
		border: 1px solid transparent;
	}
	.selected {
		border-color: var(--active_color);
		background-color: var(--bg);
	}
</style>
