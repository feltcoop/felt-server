<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import BoardItem from '$lib/ui/BoardItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let files: File[];
	export let memberPersonasById: Map<number, Persona>;

	// TODO refactor
	const toPersona = (actor_id: number): Persona => {
		const persona = memberPersonasById.get(actor_id);
		if (!persona) throw Error(`Unknown actor ${actor_id}`);
		return persona;
	};
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each files as file (file.file_id)}
		<BoardItem {file} persona={toPersona(file.actor_id)} />
	{/each}
</ul>

<style>
	ul {
		flex-direction: column-reverse;
	}
</style>
