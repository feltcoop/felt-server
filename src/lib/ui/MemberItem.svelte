<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu, personaById},
	} = getApp();

	export let persona: Readable<Persona>;
</script>

<li
	use:contextmenu.action={[[PersonaContextmenu, {persona: personaById.get($persona.persona_id)}]]}
>
	<PersonaAvatar {persona} />
</li>

<style>
	li {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
</style>
