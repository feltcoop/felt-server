<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import {type Persona} from '$lib/vocab/persona/persona';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	export let persona: Readable<Persona>;
	export let showName = true;
	export let showIcon = true;
</script>

<Avatar
	name={toName($persona)}
	icon={toIcon($persona)}
	{showName}
	{showIcon}
	contextmenuAction={[[PersonaContextmenu, {persona}]]}
/>
