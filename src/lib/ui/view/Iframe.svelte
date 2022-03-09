<script lang="ts">
	import PendingAnimationOverlay from '$lib/ui/PendingAnimationOverlay.svelte';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({space} = $viewContext);

	export let src: string;

	let loaded = false;
</script>

<!-- TODO figure out sandboxing -- allow-same-origin? -->

<div class="iframe-wrapper">
	<iframe
		sandbox="allow-scripts allow-pointer-lock"
		frameborder="0"
		title={$space.name}
		{src}
		on:load={() => (loaded = true)}
	/>
	{#if !loaded}
		<PendingAnimationOverlay />
	{/if}
</div>

<style>
	.iframe-wrapper {
		flex: 1;
		display: flex;
		position: relative; /* for the absolute positioned pending animation */
	}
	iframe {
		flex: 1;
	}
</style>
