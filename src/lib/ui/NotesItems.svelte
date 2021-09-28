<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import NotesItem from '$lib/ui/NotesItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let files: Readable<Readable<File>[]>;

	$: notes = $files.slice().reverse(); // TODO definitely not this
</script>

<ul>
	{#each notes as file (file)}
		<NotesItem {file} />
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
