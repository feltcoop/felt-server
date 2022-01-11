<script lang="ts">
	import {type Writable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {type Persona} from '$lib/vocab/persona/persona';

	export let persona: Writable<Persona>;
</script>

<Avatar name={$persona.name} />
