<script lang="ts">
	import {EMPTY_OBJECT} from '@feltcoop/felt/util/object.js';

	import {getApp} from '$lib/ui/app';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	// TODO `toComponentViewProps` and `toElementViewProps`? or expand this API?
	// Maybe `toViewProps` with optional whitelist set of property names?
	// Needs more flexibility than that -- e.g. to remove external links but preserve internal ones
	$: props = toViewProps(view) || EMPTY_OBJECT;
</script>

{#if view.type === 'svelteComponent'}{#if view.tagName in components}<svelte:component
			this={components[view.tagName]}
			{...props}
			>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:component
		>{/if}{:else if view.type === 'svelteElement'}<svelte:element this={view.tagName} {...props}
		>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:element
	>{:else if view.type === 'root'}{#each view.children as child (child)}<svelte:self
			view={child}
		/>{/each}{:else if view.type === 'text'}{view.value}{/if}
