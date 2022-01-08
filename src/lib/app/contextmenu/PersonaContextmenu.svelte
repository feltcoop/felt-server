<script lang="ts">
	import {type Writable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	let persona: Writable<Persona>;
	$: persona = $contextmenu.items.PersonaContextmenu;
</script>

<Avatar name={$persona.name} />
<button
	aria-label="Create Community"
	type="button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'CommunityInput',
			props: {persona, done: () => dispatch('CloseDialog')},
		})}
>
	➕ Create Community
</button>
<button type="button" on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}>
	Manage Memberships
</button>
