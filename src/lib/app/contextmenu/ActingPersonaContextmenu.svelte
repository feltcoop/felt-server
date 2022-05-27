<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<PersonaAvatar {persona} showName={false} />
	</svelte:fragment>
	<PersonaAvatar {persona} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CommunityInput,
					props: {persona, done: () => dispatch.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Create Community
		</ContextmenuEntry>
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: ManageMembershipForm})}>
			Manage Memberships
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
