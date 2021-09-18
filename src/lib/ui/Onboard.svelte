<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';

	import {getApp} from '$lib/ui/app';
	import PersonaInput from '$lib/ui/PersonaInput.svelte';

	const {api} = getApp();
</script>

<Markup>
	<div class="welcome">{icons.waving}</div>
	<PersonaInput createPersona={api.createPersona} />
</Markup>

<style>
	.welcome {
		font-size: var(--font_size_xl7);
		text-align: center;
	}
</style>
