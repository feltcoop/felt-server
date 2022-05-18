<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import PersonaInput from '$lib/ui/PersonaInput.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import {session} from '$app/stores';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';

	const {
		dispatch,
		ui: {sessionPersonas, personaSelection},
	} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="entry">
		<span class="menu-item-entry">
			<UnicodeIcon icon="⚙️" /><span class="title">Account</span></span
		>
	</svelte:fragment>
	<svelte:fragment slot="menu">
		{#each $sessionPersonas as sessionPersona (sessionPersona)}
			{#if $personaSelection === sessionPersona}
				<li class="menu-item panel-inset" role="none">
					<PersonaAvatar persona={sessionPersona} />
				</li>
			{:else}
				<!-- TODO support store param? only? -->
				<ContextmenuEntry
					action={() => dispatch.SelectPersona({persona_id: sessionPersona.get().persona_id})}
				>
					<PersonaAvatar persona={sessionPersona} />
				</ContextmenuEntry>
			{/if}
		{/each}
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: PersonaInput,
					props: {done: () => dispatch.CloseDialog()},
				})}
		>
			<span class="title">Create Persona</span>
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: About,
				})}
		>
			<span class="title">About</span>
		</ContextmenuEntry>
		{#if !$session.guest}
			<ContextmenuEntry action={() => dispatch.LogoutAccount()}>
				<span class="title">Log out</span>
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
