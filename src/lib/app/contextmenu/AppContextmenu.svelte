<script lang="ts">
	import {VITE_GIT_HASH} from '$lib/config';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import PersonaInput from '$lib/ui/PersonaInput.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

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
		<li role="none" class="menu-item">
			<span class="title">
				💚
				<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
					>felt-server</a
				>
				version
				<a href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}" target="_blank">
					{VITE_GIT_HASH}
				</a>
			</span>
		</li>
	</svelte:fragment>
</ContextmenuSubmenu>
