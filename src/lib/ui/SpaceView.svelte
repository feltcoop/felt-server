<script lang="ts">
	import {type Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {type Space} from '$lib/vocab/space/space';
	import {type ViewData} from '$lib/vocab/view/view';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {components},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	// TODO delete this once `view` is a JSON column of `Space`
	const toViewData = (space: Space): ViewData => {
		switch (space.media_type) {
			case 'application/fuz+json': {
				return JSON.parse(space.content);
			}
			default: {
				throw Error(`Unhandled space media type ${space.media_type}`);
			}
		}
	};

	$: viewData = toViewData($space);
	$: component = components[viewData.type];
</script>

{#if component}
	<svelte:component this={component} {persona} {community} {space} {...viewData.props} />
{:else}
	<Message status="error">
		unknown space type: {viewData.type}
	</Message>
{/if}
