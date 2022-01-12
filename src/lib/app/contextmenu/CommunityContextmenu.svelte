<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';
	import ContextsubmenuItem from '$lib/ui/contextmenu/ContextsubmenuItem.svelte';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	let community: Readable<Community>;
	let persona: Readable<Persona>;
	$: ({community, persona} = $contextmenu.items.CommunityContextmenu);
</script>

<ContextsubmenuItem>
	<svelte:fragment slot="button">
		<Avatar name={$community.name} type="Community" />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuItem
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceInput',
					props: {persona, community, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Space
		</ContextmenuItem>
		<ContextmenuItem
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'MembershipInput',
					props: {community},
				})}
		>
			Invite Members
		</ContextmenuItem>
	</svelte:fragment>
</ContextsubmenuItem>
