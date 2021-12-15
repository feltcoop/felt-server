<script lang="ts">
	import {getContextmenuComponents} from '$lib/ui/contextmenu/contextmenuComponents';
	import type {Entity} from '$lib/vocab/entity/entity';

	const contextmenuComponents = getContextmenuComponents();

	export let entity: Entity;

	$: component = contextmenuComponents[entity.type];
</script>

<section>
	{#if component}
		<svelte:component this={component} {entity} />
	{:else}
		<em>[error: not implemented for '{entity.type}']</em>
	{/if}
</section>
