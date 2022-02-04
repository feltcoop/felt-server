<script lang="ts">
	import {type Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {components, viewBySpace},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	$: viewData = $viewBySpace.value.get(space) || $space.view;
	$: component = components[viewData.type];
</script>

{#if component}
	<svelte:component this={component} {persona} {community} {space} {...viewData.props} />
{:else}
	<Message status="error">
		unknown space type: {viewData.type}
	</Message>
{/if}
