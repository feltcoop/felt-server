<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<Avatar name={$persona.name} />
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: CommunityInput,
					props: {persona, done: () => dispatch('CloseDialog')},
					dialogProps: {layout: 'page'},
				})}
		>
			<span class="title">Create Community</span>
		</ContextmenuEntry>
		<ContextmenuEntry action={() => dispatch('OpenDialog', {Component: ManageMembershipForm})}>
			<span class="title">Manage Memberships</span>
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
