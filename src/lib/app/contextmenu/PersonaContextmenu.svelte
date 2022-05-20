<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
</script>

<li class="menu-item" role="none">
	<div class="content">
		<div class="icon"><PersonaAvatar {persona} showName={false} /></div>
		<div class="title"><PersonaAvatar {persona} showIcon={false} /></div>
	</div>
</li>
