<script lang="ts">
	// TODO upstream to Felt
	export let hue: number;
</script>

<div class="indicator" style="--hue: {hue};">
	hue: {hue}
</div>
<div class="minimap" />
<input type="range" bind:value={hue} min="0" max="360" />

<style>
	.indicator {
		background-color: hsl(var(--hue) 50% 50%);
		height: var(--spacing_xl5);
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font_size_lg);
		font-weight: bold;
		color: #fff;
	}
	.minimap {
		content: '';
		/* TODO this is imperfect */
		background: linear-gradient(
			90deg,
			hsl(0, 50%, 50%) 0%,
			hsl(36, 50%, 50%) 10%,
			hsl(72, 50%, 50%) 20%,
			hsl(108, 50%, 50%) 30%,
			hsl(144, 50%, 50%) 40%,
			hsl(180, 50%, 50%) 50%,
			hsl(216, 50%, 50%) 60%,
			hsl(252, 50%, 50%) 70%,
			hsl(288, 50%, 50%) 80%,
			hsl(324, 50%, 50%) 90%,
			hsl(360, 50%, 50%) 100%
		);
		height: var(--spacing_xl);
		width: 100%;
	}
</style>
