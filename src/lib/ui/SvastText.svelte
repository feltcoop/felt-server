<script lang="ts">
	import SvastView from '$lib/ui/SvastView.svelte';
	import {parseView} from '$lib/vocab/view/view';

	export let text: string;

	$: view = parseView(text); // TODO caching (with eviction in `updateSpace`?) see this comment elsewhere too
</script>

<SvastView {view} />
