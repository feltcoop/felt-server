<script lang="ts">
	//TODO consider alert levels & numbers, etc as props
</script>

<div class="freshness-indicator-wrapper">
	<div class="freshness-indicator" />
</div>

<style>
	.freshness-indicator {
		width: 12px;
		height: 12px;
		background-color: white;
		border-radius: 50%;
	}
	.freshness-indicator-wrapper {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
