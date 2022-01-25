<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {type Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
</script>

<Avatar name={$persona.name} />
