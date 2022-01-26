<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;
	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu {contextmenu}>
	<svelte:fragment slot="entry">
		<Avatar name={$community.name} type="Community" />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			{contextmenu}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceInput',
					props: {persona, community, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Space
		</ContextmenuEntry>
		<ContextmenuEntry
			{contextmenu}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'MembershipInput',
					props: {community},
				})}
		>
			Invite Members
		</ContextmenuEntry>
		<ContextmenuEntry {contextmenu}>TODO removeme</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
