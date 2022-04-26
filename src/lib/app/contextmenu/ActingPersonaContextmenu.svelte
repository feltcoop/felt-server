<script lang="ts">
	import type {Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';

	// TODO BLOCK previously these were just imported and forwarded as event props,
	// but making things serializable means we can't do that.
	// The problem with registering them globally as `components` is they'll bloat the default JS payload.
	// I can see two solutions right now:
	// - dynamic imports in the dialog opener
	// - register them here, like `registerComponent(CommunityInput)`,
	// so they'll be available in `components` because every dispatching module is responsible for registering what they use
	// import CommunityInput from '$lib/ui/CommunityInput.svelte';
	// import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';

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
				dispatch.OpenDialog({
					Component: 'CommunityInput',
					// TODO how to handle `done` with serializable props?
					// maybe we need to register it here in the component? see above too.
					// `registerDialog(CommunityInput, {done: () => ...})`
					props: {persona, done: () => dispatch.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			<span class="title">Create Community</span>
		</ContextmenuEntry>
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: 'ManageMembershipForm'})}>
			<span class="title">Manage Memberships</span>
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
