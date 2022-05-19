<script lang="ts">
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import {getContextmenu, type ContextmenuAction} from '$lib/ui/contextmenu/contextmenu';

	export let action: ContextmenuAction;

	const contextmenu = getContextmenu();

	const entry = contextmenu.addEntry(action);

	const onMousemove = (e: MouseEvent) => {
		e.stopImmediatePropagation();
		contextmenu.select(entry);
	};

	// the `$contextmenu` is needed because `entry` is not reactive
	$: ({selected, pending, errorMessage} = ($contextmenu, entry));
	$: console.log(`pending, errorMessage`, pending, errorMessage);

	// TODO BLOCK store instead of mutation?
	// $entryAction.call;
	// $entryAction.pending;
	// $entryAction.errorMessage;

	// TODO BLOCK can we remove the content wrapper for entries? only needed for submenus?
</script>

<!-- TODO should be <a> ? But they don't have a `href` currently which is an a11y warning -- should they?
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
(in Chrome/FF contextmenus, `Tab` doesn't work, but maybe it should here?)
-->
<!-- <AsyncCall fn={() => contextmenu.activate(entry)} let:call let:pending let:errorMessage> -->
<li
	class="menu-item"
	role="menuitem"
	class:selected
	title={errorMessage ? `Error: ${errorMessage}` : undefined}
	on:click={() => {
		// This timeout lets event handlers react to the current DOM
		// before the action's changes are applied.
		setTimeout(() => contextmenu.activate(entry));
	}}
	on:mousemove={onMousemove}
>
	<div class="content">
		<div class="title"><slot {pending} {errorMessage} /></div>
		{#if pending}<PendingAnimation />{/if}
		{#if errorMessage}<div class="error">Error: {errorMessage}</div>{/if}
	</div>
</li>
<!-- </AsyncCall> -->
