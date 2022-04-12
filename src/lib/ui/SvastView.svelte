<script lang="ts">
	import {EMPTY_OBJECT} from '@feltcoop/felt/util/object.js';

	import {getApp} from '$lib/ui/app';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	$: props = toViewProps(view) || EMPTY_OBJECT;

	$: console.log(`view, props`, view, props);
</script>

{#if view.type === 'root'}
	{#each view.children as childView (childView)}
		<svelte:self view={childView} />
	{/each}
{:else if view.type === 'svelteComponent' && view.tagName in components}
	<svelte:component this={components[view.tagName]} {...props}>
		{#each view.children as childView (childView)}
			<svelte:self view={childView} />
		{/each}
	</svelte:component>
{:else if view.type === 'svelteElement'}
	<svelte:element this={view.tagName} {...props}>
		{#each view.children as childView (childView)}
			<svelte:self view={childView} />
		{/each}
	</svelte:element>
{/if}
