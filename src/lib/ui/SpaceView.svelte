<script lang="ts">
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {setViewContext} from '$lib/vocab/view/view';
	import SvastText from '$lib/ui/SvastText.svelte';

	const {
		dispatch,
		ui: {viewBySpace},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	$: directory_id = $space.directory_id;
	//TODO we might want to just roll the logic from this event into the SelectSpace mutation
	$: dispatch.ClearFreshness({directory_id});

	const viewContext = writable({persona, community, space});
	setViewContext(viewContext);

	let ready = false; // avoids a wasteful `viewContext` change on mount
	$: if (ready) {
		viewContext.set({persona, community, space});
	} else {
		ready = true;
	}

	$: viewText = $viewBySpace.value.get(space) || $space.view;
</script>

<SvastText text={viewText} />
