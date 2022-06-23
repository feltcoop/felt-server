<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Space} from '$lib/vocab/space/space';

	export let space: Readable<Space | null>;
	export let communityPersonas: Array<Readable<Persona>>;
</script>

<div class="marquee-nav">
	{#if $space}<span class="icon">{$space.icon}</span>{/if}
	{#if communityPersonas.length > 1}{communityPersonas.length}{/if}
</div>

<style>
	.marquee-nav {
		position: relative;
		display: flex;
		align-items: center;
		height: var(--navbar_size);
		background-color: var(--tint_dark_1);
		padding-right: var(--navbar_size); /* placeholder for button, which is rendered elsewhere */
		padding-left: var(--spacing_md);
	}
	.icon {
		font-size: var(--font_size_lg);
		padding-right: var(--spacing_md);
	}
</style>
