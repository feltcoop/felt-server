<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	// TODO BLOCK should these be in context, totally decoupled from the SvastView? pretty sure yes
	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	$: props = toViewProps(view);
</script>

{#if view.type === 'root'}
	{#each view.children as childView (childView)}
		<svelte:self view={childView} {persona} {community} {space} />
	{/each}
{:else if view.type === 'svelteComponent' && view.tagName in components}
	<!-- TODO render children -->
	<svelte:component this={components[view.tagName]} {persona} {community} {space} {...props} />
{/if}
