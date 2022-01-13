<script lang="ts">
	import {isEditable} from '@feltcoop/felt/util/dom.js';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {onContextmenu} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {components},
	} = getApp();

	// TODO upstream to Felt

	export let contextmenu: ContextmenuStore;

	let contextmenuEl: HTMLElement;

	// This handler runs during the event's `capture` phase
	// so that things like the Dialog don't eat the events and prevent the contextmenu from closing.
	const onWindowMousedown = (e: MouseEvent) => {
		if (!contextmenuEl.contains(e.target as any)) {
			contextmenu.close();
		}
	};

	// TODO hook into a ui input system
	const onWindowKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && !(e.target instanceof HTMLElement && isEditable(e.target))) {
			contextmenu.close();
			e.stopPropagation();
			e.preventDefault();
		}
	};

	// TODO hacky -- maybe check things like `role="button"`? also, upstream to Felt utils
	const isInteractive = (el: Element): boolean =>
		el.tagName === 'A' ||
		el.tagName === 'BUTTON' ||
		el.tagName === 'AREA' ||
		!!el.closest('button,a');

	const onClickContent = (e: MouseEvent) => {
		// TODO this is hacky, but improves the behavior to let us select content on the contextmenu,
		// but automatically closes if e.g. a button is clicked, and the button can `stopPropagation`
		// to keep the contextmenu open, because it'll stop it before this handler runs
		if (isInteractive(e.target as any)) {
			contextmenu.close();
		} else {
			e.stopPropagation();
		}
	};

	$: keys = Object.keys($contextmenu.items);

	const doContextmenu = onContextmenu(contextmenu);
</script>

<!-- TODO need long-press detection for contextmenu on iOS -->
<!-- TODO ensure `mousedown` works everywhere; might want to add `touchstart` or substitute `pointerdown` -->
<!-- Capture keydown so it can handle the event before any dialogs. -->
<svelte:window
	on:contextmenu|capture={(e) => doContextmenu(e, contextmenuEl)}
	on:mousedown|capture={$contextmenu.open ? onWindowMousedown : undefined}
	on:keydown|capture={$contextmenu.open ? onWindowKeydown : undefined}
/>

<!--
	TODO This originally had an `in:scale` transition, `in:scale={{duration: 50}}`
	but even a 50ms animation makes it feel slow.
	Maybe a better solution is to show the content immediately, but animate the periphery.
-->
{#if $contextmenu.open}
	<div
		class="contextmenu pane"
		role="menu"
		aria-modal
		tabindex="-1"
		bind:this={contextmenuEl}
		style="transform: translate3d({$contextmenu.x}px, {$contextmenu.y}px, 0);"
	>
		<div on:click={onClickContent}>
			{#each keys as key (key)}
				{#if key in components}
					<section class="panel-inset">
						<!-- TODO maybe pass through the key/value generically? -->
						<svelte:component this={components[key]} {contextmenu} />
					</section>
				{:else}
					<Message status="error">unknown contextmenu "{key}"</Message>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<style>
	.contextmenu {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 9;
		width: var(--contextmenu_width);
		border: var(--border);
	}
	section {
		border-bottom: var(--border);
	}
	section:last-child {
		border-bottom: none;
	}
</style>
