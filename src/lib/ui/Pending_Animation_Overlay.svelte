<script lang="ts">
	// TODO extract to Felt
	import Pending_Animation from '@feltcoop/felt/ui/Pending_Animation.svelte';
</script>

<div class="pending-animation-overlay">
	<Pending_Animation />
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
