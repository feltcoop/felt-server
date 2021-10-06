<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';

	import PersonaInput from '$lib/ui/PersonaInput.svelte';
</script>

<Markup>
	<div class="welcome">{icons.waving}</div>
	<PersonaInput />
</Markup>

<style>
	.welcome {
		font-size: var(--font_size_xl7);
		text-align: center;
	}
</style>
