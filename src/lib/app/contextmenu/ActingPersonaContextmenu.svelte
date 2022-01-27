<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<Avatar name={$persona.name} />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					name: 'CommunityInput',
					props: {persona, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Community
		</ContextmenuEntry>
		<ContextmenuEntry action={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}>
			Manage Memberships
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
