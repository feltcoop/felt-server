<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Entity} from '$lib/vocab/entity/entity';
	import SvastText from '$lib/ui/SvastText.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';

	export let entity: Readable<Entity>;

	$: content = $entity.data.content ?? ''; // TODO empty fallback?
</script>

{#if $entity.data.type === 'Tombstone'}<TombstoneContent {entity} />{:else}<SvastText
		text={content}
	/>{/if}
