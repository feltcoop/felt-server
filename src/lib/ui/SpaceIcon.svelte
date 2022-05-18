<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Space} from '$lib/vocab/space/space.js';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let space: Readable<Space>;
</script>

<UnicodeIcon icon={$space.icon} label={$space.name} />
