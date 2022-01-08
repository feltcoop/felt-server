<script lang="ts">
	import {get} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personaSelection, communities},
	} = getApp();

	export let contextmenu: ContextmenuStore;

	// TODO don't use selections
	$: persona = $personaSelection;

	// TODO lookup from `communitiesById` map instead
	$: community = $communities.find(
		(c) => get(c).community_id === $contextmenu.items.CommunityContextmenu,
	)!;
</script>

<Avatar name={$community.name} type="Community" />
<button
	type="button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'SpaceInput',
			props: {persona, community, done: () => dispatch('CloseDialog')},
		})}
>
	➕ Create Space
</button>
<button
	type="button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'MembershipInput',
			props: {community},
		})}
>
	✉️ Invite Members
</button>
