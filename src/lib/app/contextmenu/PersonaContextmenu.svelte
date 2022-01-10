<script lang="ts">
	import {type Writable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {type Persona} from '$lib/vocab/persona/persona';

	export let contextmenu: ContextmenuStore;

	let persona: Writable<Persona>;
	$: persona = $contextmenu.items.PersonaContextmenu;
</script>

<Avatar name={$persona.name} />
