<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personaSelection},
	} = getApp();

	export let contextmenu: ContextmenuStore;

	$: selectedPersona = $personaSelection; // TODO use the value not the selection

	$: value = $contextmenu.entities!.persona;
</script>

<section class="markup panel-outset">
	<Avatar name={value} />
	<button
		aria-label="Create Community"
		type="button"
		on:click={() =>
			dispatch('OpenDialog', {
				name: 'CommunityInput',
				props: {persona: selectedPersona, done: () => dispatch('CloseDialog')},
			})}
	>
		➕ Create Community
	</button>
	<button type="button" on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}>
		Manage Memberships
	</button>
</section>
