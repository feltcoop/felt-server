<script lang="ts">
	export let icon: string;
	export let label: string | undefined = undefined;
</script>

<span aria-label={label}>{icon}</span>

<style>
	span {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--icon_size);
		height: var(--icon_size);
	}
</style>
