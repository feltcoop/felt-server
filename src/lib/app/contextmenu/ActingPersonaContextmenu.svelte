<script lang="ts">
	import {type Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {type Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
</script>

<Avatar name={$persona.name} />
<button
	type="button"
	class="menu-button"
	on:click={() =>
		dispatch('OpenDialog', {
			name: 'CommunityInput',
			props: {persona, done: () => dispatch('CloseDialog')},
		})}
>
	Create Community
</button>
<button
	type="button"
	class="menu-button"
	on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}
>
	Manage Memberships
</button>
