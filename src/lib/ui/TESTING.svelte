<script lang="ts">
	export let testing: any;
</script>

<div>
	<div>{JSON.stringify(Array.from($testing.value.entries()))}</div>
	<button
		on:click={() => {
			testing.mutate(($v) => $v.set($v.size, $v.size));
		}}>testing</button
	>
</div>
