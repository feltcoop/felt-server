<script lang="ts">
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	export let pending: boolean;
	export let el: HTMLButtonElement | undefined = undefined; // TODO is this the pattern we want?
</script>

<button {...$$restProps} class:pending bind:this={el} on:click>
	<div class="content">
		<slot />
	</div>
	{#if pending}
		<div class="animation">
			<PendingAnimation />
		</div>
	{/if}
</button>

<style>
	button {
		position: relative;
	}
	.content {
		display: contents;
	}
	.pending .content {
		visibility: hidden;
	}
	.animation {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
