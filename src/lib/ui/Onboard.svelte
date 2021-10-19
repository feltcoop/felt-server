<script lang="ts">
	import {icons} from '@feltcoop/felt';

	import PersonaInput from '$lib/ui/PersonaInput.svelte';
</script>

<div class="markup">
	<div class="welcome">{icons.waving}</div>
	<PersonaInput />
</div>

<style>
	.welcome {
		font-size: var(--font_size_xl7);
		text-align: center;
	}
</style>
