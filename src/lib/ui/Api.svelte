<script lang="ts">
	import {get_api} from '$lib/ui/api';

	const api = get_api();

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
