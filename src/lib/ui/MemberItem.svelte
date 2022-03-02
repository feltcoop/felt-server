<script lang="ts">
	import type {Readable} from 'svelte/store';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<Persona>;
</script>

{#if $persona.type === 'account'}
	<li
		use:contextmenu.action={[[PersonaContextmenu, {persona: personaById.get($persona.persona_id)}]]}
	>
		<PersonaAvatar {persona} />
	</li>
{/if}
