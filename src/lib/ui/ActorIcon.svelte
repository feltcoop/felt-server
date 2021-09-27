<script lang="ts">
	import type {EntityType} from '$lib/vocab/entity/entity';

	// TODO maybe rename this to `EntityIcon`?

	export let name: string;
	export let icon: string | null = null;
	export let type: EntityType = 'Persona';
</script>

{#if icon}
	<img class="actor-icon" src={icon} alt="icon for {name}" />
{:else}
	<div class="actor-icon {type}">
		{name[0]}
	</div>
{/if}

<style>
	.actor-icon {
		height: var(--icon_size);
		width: var(--icon_size);
		min-width: var(--icon_size);
	}
	div.actor-icon {
		background-color: hsl(var(--hue), 50%, 50%);
		border-radius: 50%;
		color: white;
		font-weight: var(--font_weight_4);
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	div.Community {
		border-radius: calc(var(--icon_size) / 4);
	}
	div.Community:active {
		border-radius: calc(var(--icon_size) / 4 + 2px);
	}
</style>
