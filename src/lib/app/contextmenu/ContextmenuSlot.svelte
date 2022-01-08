<script lang="ts">
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {contextmenuComponents} from '$lib/app/contextmenu/contextmenuComponents';

	export let contextmenu: ContextmenuStore;

	// TODO hacky, but if it sticks, upstream to Felt. maybe check things like `role="button"`?
	const isInteractive = (el: Element): boolean =>
		el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.closest('button,a');

	const onClickContextmenuSlot = (e: MouseEvent) => {
		// TODO this is hacky, but improves the behavior to let us select content on the contextmenu,
		// but automatically closes if e.g. a button is clicked, and the button can `stopPropagation`
		// to keep the contextmenu open, because it'll stop it before this handler runs
		if (isInteractive(e.target as any)) {
			contextmenu.close();
		} else {
			e.stopPropagation();
		}
	};

	$: entities = $contextmenu.entities && Object.entries($contextmenu.entities);
</script>

<!-- TODO refactor all of this -->
<!-- TODO maybe ignore Community if there's a Space? So it could combine into one view instead of 2 -->
<!-- TODO implement this for arbitrary entities? blocks? -->
{#if entities}
	<div class="contextmenu-slot" on:click={onClickContextmenuSlot}>
		{#each entities as [key]}
			{#if key in contextmenuComponents}
				<section class="panel-inset">
					<svelte:component this={contextmenuComponents[key]} {contextmenu} />
				</section>
			{:else}
				<!-- TODO ? -->
			{/if}
		{/each}
	</div>
{/if}

<style>
	section {
		border-bottom: var(--border);
	}
	section:last-child {
		border-bottom: none;
	}
</style>
