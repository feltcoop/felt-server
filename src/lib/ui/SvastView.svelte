<script lang="ts">
	import {EMPTY_OBJECT} from '@feltcoop/felt/util/object.js';

	import {getApp} from '$lib/ui/app';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	// TODO `toComponentViewProps` and `toElementViewProps`? or expand this API?
	// Maybe `toViewProps` with optional allowlist of property names?
	// A simple allowlist is not enough: it needs the flexibility to, for example,
	// remove external links but preserve internal ones.
	// But should that be done upstream, before the properties are saved in the `view`,
	// through a `sanitize` helper that converts a parsed SVAST to a sanitized one?
	// Then this component wouldn't have to concern itself with security.
	$: props = toViewProps(view) || EMPTY_OBJECT;
</script>

<!-- TODO is using keyed each blocks ideal here? maybe create an id for each node? -->
<!-- TODO should this render a fallback for unknown components? perhaps with a button to select a valid one? -->
{#if view.type === 'svelteComponent'}{#if view.tagName in components}<svelte:component
			this={components[view.tagName]}
			{...props}
			>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:component
		>{/if}{:else if view.type === 'svelteElement'}<svelte:element this={view.tagName} {...props}
		>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:element
	>{:else if view.type === 'root'}{#each view.children as child (child)}<svelte:self
			view={child}
		/>{/each}{:else if view.type === 'text'}{view.value}{/if}
