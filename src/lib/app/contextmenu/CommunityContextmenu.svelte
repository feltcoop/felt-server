<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {spaceSelection, communitySelection, personaSelection},
	} = getApp();

	export let contextmenu: ContextmenuStore;

	// TODO don't use selections
	$: selectedSpace = $spaceSelection;
	$: community = $communitySelection;
	$: persona = $personaSelection;

	$: value = $contextmenu.entities!.community;
</script>

<section class="markup panel-outset">
	<Avatar name={value} type="Community" />
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
	<button
		type="button"
		on:click={() =>
			dispatch('OpenDialog', {
				name: 'SpaceDelete',
				props: {space: selectedSpace, done: () => dispatch('CloseDialog')},
			})}
	>
		🗑️ Delete Space
	</button>
</section>
