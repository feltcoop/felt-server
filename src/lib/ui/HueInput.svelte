<script lang="ts">
	// TODO upstream this component to Felt
	export let hue: number;
</script>

<div class="indicator" style="--hue: {hue};">
	hue: {hue}
</div>
<!-- TODO make the minimap draggable -->
<div
	class="minimap"
	on:click={(e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.x) / rect.width;
		hue = Math.floor(360 * pct);
	}}
	role="button"
/>
<input type="range" bind:value={hue} min="0" max="359" />

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
	/* TODO generic way to make this seamless? */
	input {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
</style>
