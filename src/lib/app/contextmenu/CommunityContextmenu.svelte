<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let contextmenu: ContextmenuStore;

	let community: Readable<Community>;
	let persona: Readable<Persona>;
	$: ({community, persona} = $contextmenu.items.CommunityContextmenu);
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
	Create Space
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
	Invite Members
</button>
