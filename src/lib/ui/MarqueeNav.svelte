<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';

	export let communityPersonas: Array<Readable<Persona>>;
</script>

<div class="marquee-nav">Members — {communityPersonas.length}</div>

<style>
	.marquee-nav {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: var(--navbar_size);
		background-color: var(--tint_dark_1);
		padding-right: var(--navbar_size); /* placeholder for button, which is rendered elsewhere */
		padding-left: var(--spacing_lg);
	}
</style>
