<script lang="ts">
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {contextmenuComponents} from '$lib/app/contextmenu/contextmenuComponents';
	import Message from '@feltcoop/felt/ui/Message.svelte';

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

	$: keys = $contextmenu.items && Object.keys($contextmenu.items);
</script>

{#if keys}
	<div class="contextmenu-slot" on:click={onClickContextmenuSlot}>
		{#each keys as key (key)}
			{#if key in contextmenuComponents}
				<section class="panel-inset">
					<svelte:component this={contextmenuComponents[key]} {contextmenu} />
				</section>
			{:else}
				<Message status="error">unknown contextmenu "{key}"</Message>
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
