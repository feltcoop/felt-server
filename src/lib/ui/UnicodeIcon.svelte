<script lang="ts">
	export let icon: string;
	export let label: string | undefined = undefined;
</script>

<div aria-label={label} {...$$restProps}>{icon}</div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--icon_size);
		height: var(--icon_size);
	}
</style>
