<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;
	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu {contextmenu}>
	<svelte:fragment slot="entry">
		<Avatar name={$persona.name} />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			{contextmenu}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'CommunityInput',
					props: {persona, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Community
		</ContextmenuEntry>
		<ContextmenuEntry
			{contextmenu}
			on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}
		>
			Manage Memberships
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
<ContextmenuEntry {contextmenu}>Testig thing</ContextmenuEntry>
