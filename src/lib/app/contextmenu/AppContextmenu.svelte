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
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="⚙️" />
	</svelte:fragment>
	Account
	<svelte:fragment slot="menu">
		{#each $sessionPersonas as sessionPersona (sessionPersona)}
			{#if $personaSelection === sessionPersona}
				<li class="menu-item panel-inset" role="none">
					<div class="content">
						<div class="icon"><PersonaAvatar persona={sessionPersona} showName={false} /></div>
						<div class="title"><PersonaAvatar persona={sessionPersona} showIcon={false} /></div>
					</div>
				</li>
			{:else}
				<!-- TODO support store param? only? -->
				<ContextmenuEntry
					action={() => dispatch.SelectPersona({persona_id: sessionPersona.get().persona_id})}
				>
					<svelte:fragment slot="icon"
						><PersonaAvatar persona={sessionPersona} showName={false} /></svelte:fragment
					>
					<PersonaAvatar persona={sessionPersona} showIcon={false} />
				</ContextmenuEntry>
			{/if}
		{/each}
		{#if !$session.guest}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: PersonaInput,
						props: {done: () => dispatch.CloseDialog()},
					})}
			>
				Create Persona
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: About})}>
			About
		</ContextmenuEntry>
		{#if !$session.guest}
			<ContextmenuEntry action={() => dispatch.Logout()}>Log out</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
