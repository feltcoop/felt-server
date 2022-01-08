<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personasById},
	} = getApp();

	export let contextmenu: ContextmenuStore;

	$: persona_id = $contextmenu.items.PersonaContextmenu;
	$: persona = personasById.get(persona_id)!;
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
