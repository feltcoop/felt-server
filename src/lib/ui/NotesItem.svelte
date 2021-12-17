<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {findPersonaById},
	} = getApp();

	export let file: Readable<File>;

	$: persona = findPersonaById($file.actor_id);
</script>

<li data-entity="persona:{$persona.name},file:{$file.file_id}">
	{$file.content}
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border);
		max-width: var(--column_width_min);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg_color);
	}
</style>
