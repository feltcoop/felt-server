<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {api} = getApp();

	export let persona: Readable<Persona>;
	export let community: Community;
</script>

<p>
	<button
		type="button"
		class="button-join"
		on:click={() =>
			api.createMembership({
				community_id: community.community_id,
				persona_id: $persona.persona_id,
			})}
	>
		{$persona.name}
	</button>
</p>
