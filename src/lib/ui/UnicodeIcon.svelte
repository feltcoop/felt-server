<script lang="ts">
	export let icon: string;
</script>

<span>{icon}</span>

<style>
	span {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--icon_size);
		height: var(--icon_size);
	}
</style>
