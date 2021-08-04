<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';

	export let space: Space;
	export let url: string; // TODO type
</script>

<!-- TODO figure out sandboxing -- allow-same-origin? -->
<iframe sandbox="allow-scripts allow-pointer-lock" frameborder="0" title={space.name} src={url} />

<style>
	iframe {
		display: flex;
		flex: 1;
	}
</style>
