<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import ForumItem from '$lib/ui/ForumItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let files: Readable<Readable<File>[]>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $files as file (file)}
		<ForumItem {file} />
	{/each}
</ul>
