<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {type Persona} from '$lib/vocab/persona/persona';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export const contextmenu: ContextmenuStore = undefined as any;
	export let persona: Readable<Persona>;
</script>

<li role="none">
	<Avatar name={$persona.name} />
</li>
