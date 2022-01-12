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
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--font_size_xl7);
	}
</style>
