<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import PersonaInput from '$lib/ui/PersonaInput.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import {session} from '$app/stores';
	import AccountForm from '$lib/ui/AccountForm.svelte';

	const {dispatch} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<span class="menu-item-entry">
			<UnicodeIcon icon="⚙️" /><span class="title">Account</span></span
		>
	</svelte:fragment>
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: PersonaInput,
					props: {done: () => dispatch('CloseDialog')},
				})}
		>
			<span class="title">Create Persona</span>
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch('OpenDialog', {
					Component: About,
				})}
		>
			<span class="title">About</span>
		</ContextmenuEntry>
		<li role="none">
			<AccountForm guest={$session.guest} />
		</li>
	</svelte:fragment>
</ContextmenuSubmenu>
