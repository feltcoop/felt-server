<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';
	import CommunityEditor from '$lib/ui/CommunityEditor.svelte';
	import CommunityDelete from '$lib/ui/CommunityDelete.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<CommunityAvatar {community} />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CommunityEditor,
					props: {community},
				})}
		>
			<span class="title"> Edit Community </span>
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: SpaceInput,
					props: {persona, community, done: () => dispatch.CloseDialog()},
				})}
		>
			<span class="title">Create Space</span>
		</ContextmenuEntry>
		{#if $community.type !== 'personal'}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: MembershipInput,
						props: {community},
					})}
			>
				<span class="title">Invite Members</span>
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: CommunityDelete,
						props: {persona, community, done: () => dispatch.CloseDialog()},
					})}
			>
				<span class="title">Delete Community</span>
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
