<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community';

	export let space: Readable<Space>;
	export const community: Readable<Community> = undefined as any;
</script>

TODO voice -- {$space.name}
