<script lang="ts">
	import {is_editable} from '@feltcoop/felt/util/dom.js';
	import {fade} from 'svelte/transition';

	import Portal from '$lib/ui/Portal.svelte';

	export let close: () => void;
	export let target: HTMLElement | string = '#modal-wrapper';

	let el: HTMLElement;

	// TODO hook into a ui input system
	const on_window_keydown = (e: KeyboardEvent) => {
		if (!(e.target instanceof HTMLElement && is_editable(e.target))) {
			if (e.key === 'Escape') {
				close();
			}
		}
	};

	// The modal isn't "ready" until the portal moves it.
	// Rendering the the modal's slot only once it's ready fixes things like `autofocus`.
	let ready = false;
</script>

<svelte:window on:keydown={on_window_keydown} />

<!-- the `tabindex` enables scrolling because SvelteKit puts it on the body -->
<Portal
	{target}
	on:move={() => {
		ready = true;
		el.focus();
	}}
>
	<div class="modal" on:click={close} bind:this={el} tabindex="-1">
		<div class="pane" on:click|stopPropagation in:fade={{duration: 85}}>
			{#if ready}
				<slot />
			{/if}
		</div>
	</div>
</Portal>

<style>
	.modal {
		overflow-y: scroll;
		height: 100%;
		width: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 4;
		background-color: var(--overlay_bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px;
	}
	.pane {
		max-width: var(--column_width);
		background-color: var(--bg);
		box-shadow: 0px 6px 24px hsla(0, 100%, 0%, 0.8);
	}
</style>
