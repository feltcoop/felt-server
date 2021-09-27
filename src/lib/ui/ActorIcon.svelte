<script lang="ts">
	import type {ActorType} from '$lib/vocab/actor/actor';

	export let icon: string | null = null;
	export let name: string;
	export let type: ActorType = 'persona';
</script>

{#if icon}
	<img class="actor-icon" src={icon} alt="icon for {name}" />
{:else}
	<div class="actor-icon">
		{#if type === 'persona'}
			⚘
		{:else}
			⚝
		{/if}
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
</style>
