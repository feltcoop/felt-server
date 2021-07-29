<script lang="ts">
	export let name: string;
	export let icon: string | null = null;
</script>

{#if icon}
	<img src={icon} alt="icon for {name}" />
{:else}
	<div class="generated-icon">
		{name[0]}
	</div>
{/if}

<style>
	img {
		height: var(--icon_size_md);
		width: var(--icon_size_md);
		min-width: var(--icon_size_md);
	}
	.generated-icon {
		height: var(--icon_size_md);
		width: var(--icon_size_md);
		min-width: var(--icon_size_md);
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
