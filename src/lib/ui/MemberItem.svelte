<script lang="ts">
	import type {Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu, personasById},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
</script>

{#if $persona.type === 'account'}
	<li
		use:contextmenu.action={[
			[PersonaContextmenu, {persona: personasById.get($persona.persona_id)}],
		]}
	>
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
	</li>
{/if}
