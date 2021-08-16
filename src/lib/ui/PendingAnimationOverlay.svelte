<script lang="ts">
	// TODO extract to Felt
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
</script>

<div class="pending-animation-overlay">
	<PendingAnimation />
</div>

<style>
	.pending-animation-overlay {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--font_size_xl7);
	}
</style>
