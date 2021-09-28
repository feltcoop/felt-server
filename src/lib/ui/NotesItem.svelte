<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {File} from '$lib/vocab/file/file.js';

	export let file: Readable<File>;
</script>

<li>
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
