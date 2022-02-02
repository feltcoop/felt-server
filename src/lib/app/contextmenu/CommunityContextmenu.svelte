<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<Avatar name={$community.name} type="Community" />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: SpaceInput,
					props: {persona, community, done: () => dispatch('CloseDialog')},
				})}
		>
			Create Space
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: MembershipInput,
					props: {community},
				})}
		>
			Invite Members
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
