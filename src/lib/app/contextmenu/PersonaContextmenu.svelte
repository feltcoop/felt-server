<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
</script>

<li class="menu-item" role="none">
	<div class="content">
		<div class="icon">
			<Avatar name={$persona.name} showName={false} />
		</div>
		<div class="title">
			<Avatar name={$persona.name} showIcon={false} />
		</div>
	</div>
</li>
