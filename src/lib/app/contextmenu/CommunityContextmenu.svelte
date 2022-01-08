<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personaSelection},
	} = getApp();

	export let contextmenu: ContextmenuStore;

	// TODO don't use selections
	$: persona = $personaSelection;

	$: community = $contextmenu.items.CommunityContextmenu;
</script>

<Avatar name={$community.name} type="Community" />
<button
	type="button"
	class="menu-button"
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
	class="menu-button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'MembershipInput',
			props: {community},
		})}
>
	✉️ Invite Members
</button>
