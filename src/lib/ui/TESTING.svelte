<script lang="ts">
	import {locallyStored} from '$lib/util/storage';
	import {mutable} from '@feltcoop/svelte-gettable-stores';

	const testing = locallyStored(
		mutable<Map<number, number | null>>(new Map()),
		'TODO_KEY',
		($v) => Array.from($v.entries()),
		(serialized) => new Map(serialized),
	);
</script>

<div>
	<div>{JSON.stringify(Array.from($testing.value.entries()))}</div>
	<button
		on:click={() => {
			testing.mutate(($v) => $v.set($v.size, $v.size));
		}}>testing</button
	>
</div>
