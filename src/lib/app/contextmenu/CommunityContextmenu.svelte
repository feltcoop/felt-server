<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';
	import ContextmenuSubmenuItem from '$lib/ui/contextmenu/ContextmenuSubmenuItem.svelte';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;
	export let menuIndex: number; // TODO infer this automatically everywhere it appears
	export let itemIndex: number; // TODO infer this automatically everywhere it appears

	let community: Readable<Community>;
	let persona: Readable<Persona>;
	$: ({community, persona} = $contextmenu.items.CommunityContextmenu);
</script>

<ContextmenuSubmenuItem {contextmenu} {menuIndex} {itemIndex}>
	<svelte:fragment slot="button">
		<Avatar name={$community.name} type="Community" />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={0}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'SpaceInput',
					props: {persona, community, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Space
		</ContextmenuItem>
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={1}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'MembershipInput',
					props: {community},
				})}
		>
			Invite Members
		</ContextmenuItem>
	</svelte:fragment>
</ContextmenuSubmenuItem>
