<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import RoomItem from '$lib/ui/RoomItem.svelte';

	export let files: Readable<Readable<File>[]>;
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each $files as file (file)}
		<RoomItem {file} />
	{/each}
</ul>
