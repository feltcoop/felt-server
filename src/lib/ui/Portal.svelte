<script lang="ts">
	import {onDestroy} from 'svelte';

	export let target: Element | string = 'body';
	export let on_move: ((el: Element, target: Element) => void) | null = null;

	let el: Element;

	onDestroy(() => {
		el.parentNode?.removeChild(el);
	});

	$: el && move_to_target(el, target);

	const move_to_target = (el: Element, target: Element | string): void => {
		const target_el = typeof target === 'string' ? document.querySelector(target) : target;
		if (!target_el) {
			throw Error('Failed to resolve Portal target: ' + target);
		}
		target_el.appendChild(el);
		on_move?.(el, target_el);
	};
</script>

<div hidden>
	<div class="portal" bind:this={el}>
		<slot />
	</div>
</div>
