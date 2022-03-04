<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Space} from '$lib/vocab/space/space';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import SvastView from '$lib/ui/SvastView.svelte';

	const {
		ui: {viewBySpace},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	$: view = $viewBySpace.value.get(space) || $space.view;
</script>

<SvastView {view} {persona} {community} {space} />
