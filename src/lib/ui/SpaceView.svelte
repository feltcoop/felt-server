<script lang="ts">
	import {writable, type Readable} from 'svelte/store';

	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import SvastView from '$lib/ui/SvastView.svelte';
	import {setViewContext} from '$lib/vocab/view/view';

	const {
		ui: {viewBySpace},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	const viewContext = writable({persona, community, space});
	setViewContext(viewContext);
	let ready = false; // avoids a wasteful `viewContext` change on mount
	$: if (ready) {
		viewContext.set({persona, community, space});
	} else {
		ready = true;
	}

	$: view = $viewBySpace.value.get(space) || $space.view;
</script>

<SvastView {view} />
