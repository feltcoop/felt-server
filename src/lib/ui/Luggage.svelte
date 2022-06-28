<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();
</script>

<div class="luggage">
	<button
		class="icon-button plain-button"
		aria-label="toggle luggage"
		on:click={() => dispatch.ToggleMainNav()}
	>
		<span>☰</span>
	</button>
</div>

<style>
	.luggage {
		--icon_size: var(--luggage_size);
		z-index: 3;
		position: absolute;
		left: 0;
		top: 0;
	}
	button {
		height: var(--navbar_size);
		border-radius: 0;
	}
	button:active span {
		transform: scale3d(1.16, 1.16, 1.16);
	}
</style>
