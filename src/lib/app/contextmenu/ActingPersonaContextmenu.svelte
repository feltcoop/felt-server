<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuItem from '$lib/ui/contextmenu/ContextmenuItem.svelte';
	import ContextmenuSubmenuItem from '$lib/ui/contextmenu/ContextmenuSubmenuItem.svelte';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;
	export let menuIndex: number; // TODO infer this automatically everywhere it appears
	export let itemIndex: number; // TODO infer this automatically everywhere it appears
	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenuItem {contextmenu} {menuIndex} {itemIndex}>
	<svelte:fragment slot="button">
		<Avatar name={$persona.name} />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={0}
			on:click={() =>
				dispatch('OpenDialog', {
					name: 'CommunityInput',
					props: {persona, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Community
		</ContextmenuItem>
		<ContextmenuItem
			{contextmenu}
			menuIndex={menuIndex + 1}
			itemIndex={1}
			on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}
		>
			Manage Memberships
		</ContextmenuItem>
	</svelte:fragment>
</ContextmenuSubmenuItem>
<ContextmenuItem {contextmenu} {menuIndex} itemIndex={itemIndex + 1}>Testig thing</ContextmenuItem>
