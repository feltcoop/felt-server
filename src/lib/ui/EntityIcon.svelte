<script lang="ts">
	import type {EntityType} from '$lib/vocab/entity/entity.schema';

	export let name: string;
	export let icon: string | null = null;
	export let type: EntityType = 'Persona';

	$: squared = type === 'Community';
</script>

{#if icon}
	<img class="entity-icon" class:squared src={icon} alt="icon for {name}" />
{:else}
	<div class="entity-icon" class:squared>
		{name[0]}
	</div>
{/if}

<style>
	.entity-icon {
		height: var(--icon_size);
		width: var(--icon_size);
		min-width: var(--icon_size);
	}
	div.entity-icon {
		background-color: hsl(var(--hue), 50%, 50%);
		border-radius: 50%;
		color: white;
		font-weight: var(--font_weight_4);
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	div.squared {
		border-radius: calc(var(--icon_size) / 4);
	}
	div.squared:active {
		border-radius: calc(var(--icon_size) / 4 + 2px);
	}
</style>
