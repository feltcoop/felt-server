<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	// TODO upstream this component to Felt
	export let hue: number = 180;
	export let title: string = 'hue';

	let draggingMinimap = false;

	// Binding to `hue` externally works for simple things,
	// but the `input` event makes reacting to actual changes easier.
	const dispatch = createEventDispatcher<{input: number}>();
	const updateHue = (value: number) => {
		hue = value;
		dispatch('input', hue);
	};

	const onInput = (e: Event & {currentTarget: EventTarget & HTMLInputElement}) => {
		updateHue(Number(e.currentTarget.value));
	};

	const setHueFromMinimap = (
		e: Event & {currentTarget: EventTarget & HTMLElement; clientX: number},
	) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.x) / rect.width;
		updateHue(Math.floor(360 * pct));
	};
</script>

<!-- TODO scrub text to numerical values along some nice-feeling axes -->
<div class="indicator" style="--hue: {hue};">
	{title}: {hue}
</div>
<!-- TODO handle dragging leaving the minimap without losing focus, or
perhaps remove the dragging functionality -->
<div
	class="minimap"
	role="button"
	on:click={setHueFromMinimap}
	on:mousedown={(e) => {
		draggingMinimap = true;
		setHueFromMinimap(e);
	}}
	on:mouseup={() => {
		draggingMinimap = false;
	}}
	on:mouseleave={() => {
		draggingMinimap = false;
	}}
	on:mousemove={(e) => {
		if (draggingMinimap) setHueFromMinimap(e);
	}}
/>
<input type="range" value={hue} on:input={onInput} on:change={onInput} min="0" max="359" />

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
