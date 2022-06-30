<script lang="ts">
	//TODO consider alert levels & numbers, etc as props
</script>

<div class="freshness-indicator-wrapper">
	<div class="freshness-indicator" />
</div>

<style>
	.freshness-indicator {
		width: var(--freshness_indicator_size);
		height: var(--freshness_indicator_size);
		background-color: white;
		border-radius: 50%;
	}
	.freshness-indicator-wrapper {
		position: absolute;
		left: var(--freshness_indicator_padding);
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
