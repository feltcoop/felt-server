<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';

	export let space: Readable<Space>;
</script>

<SpaceIcon {space} />
<span>{$space.name} </span>

<style>
	span {
		padding: var(--spacing_xs);
	}
</style>
