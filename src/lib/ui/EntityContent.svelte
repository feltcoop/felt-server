<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import SvastText from '$lib/ui/SvastText.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';

	export let entity: Readable<Entity>;

	$: type = $entity.data.type;
	$: content = $entity.data.content;
</script>

{#if type === 'Tombstone'}<TombstoneContent {entity} />{:else if content}<SvastText
		text={content}
	/>{/if}
