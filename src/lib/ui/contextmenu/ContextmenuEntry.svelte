<script lang="ts">
	import {getContextmenu, type ContextmenuAction} from '$lib/ui/contextmenu/contextmenu';
	import AsyncCall from '$lib/ui/AsyncCall.svelte';

	export let action: ContextmenuAction;

	const contextmenu = getContextmenu();

	const entry = contextmenu.addEntry(action);

	const onMousemove = (e: MouseEvent) => {
		e.stopImmediatePropagation();
		contextmenu.select(entry);
	};

	// the `$contextmenu` is needed because `entry` is not reactive
	$: ({selected} = ($contextmenu, entry));

	// TODO BLOCK hmm -- problem is what if it's activated through a different UI interaction,
	// or internally in the store?
	const entryAction = toAsyncAction(() => contextmenu.activate(entry));
	$: ({call, pending, errorMessage} = entryAction);
	$entryAction.call;
	$entryAction.pending;
	$entryAction.errorMessage;
</script>

<!-- TODO should be <a> ? But they don't have a `href` currently which is an a11y warning -- should they?
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
(in Chrome/FF contextmenus, `Tab` doesn't work, but maybe it should here?)
-->
<AsyncCall fn={() => contextmenu.activate(entry)} let:call let:pending let:errorMessage>
	<li
		class="menu-item"
		role="menuitem"
		class:selected
		on:click={() => {
			// This timeout lets event handlers react to the current DOM
			// before the action's changes are applied.
			setTimeout(() => call());
		}}
		on:mousemove={onMousemove}
	>
		<slot {pending} {errorMessage} />
	</li>
</AsyncCall>
