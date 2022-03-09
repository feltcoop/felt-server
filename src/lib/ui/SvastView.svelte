<script lang="ts">
	import {EMPTY_OBJECT} from '@feltcoop/felt/util/object.js';

	import {getApp} from '$lib/ui/app';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	$: props = toViewProps(view) || EMPTY_OBJECT;
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
{/if}
