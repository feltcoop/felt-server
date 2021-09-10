<script lang="ts">
	import {getApi} from '$lib/ui/api';

	const api = getApi();

	// TODO proper api metadata
	$: keys = Object.keys($api);
</script>

<ul>
	{#each keys as key (key)}
		<li>
			<!-- TODO linkify -->
			{key}
			<!-- TODO render types -->
		</li>
	{/each}
</ul>
