<script lang="ts">
	// TODO upstream this component to Felt
	export let hue: number;
	export let title: string = 'hue';

	let draggingMinimap = false;

	const setHue = (
		e: Event & {
			currentTarget: EventTarget & HTMLElement;
			clientX: number;
		},
	) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.x) / rect.width;
		hue = Math.floor(360 * pct);
	};
</script>

<!-- TODO scrub text to numerical values along some nice-feeling axes -->
<div class="indicator" style="--hue: {hue};">
	{title}: {hue}
</div>
<!-- TODO pointer events for dragging? -->
<div
	class="minimap"
	on:click={(e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.x) / rect.width;
		hue = Math.floor(360 * pct);
	}}
	on:mousedown={(e) => {
		draggingMinimap = true;
		setHue(e);
	}}
	on:mouseup={() => {
		draggingMinimap = false;
	}}
	on:mouseleave={() => {
		draggingMinimap = false;
	}}
	on:mousemove={(e) => {
		if (draggingMinimap) setHue(e);
	}}
	role="button"
/>
<input
	type="range"
	value={hue}
	on:input={(e) => (hue = Number(e.currentTarget.value))}
	min="0"
	max="359"
/>

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
		border-top-left-radius: var(--border_radius);
		border-top-right-radius: var(--border_radius);
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
