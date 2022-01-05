<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();
</script>

<div class="luggage" data-entity="luggage">
	<button
		class="icon-button"
		aria-label="toggle luggage"
		on:click={() => dispatch('ToggleMainNav')}
	>
		☰
	</button>
</div>

<style>
	.luggage {
		z-index: 3;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
