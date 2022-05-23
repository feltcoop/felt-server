<script lang="ts">
	import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	export let text: string | undefined;

	$: errorMessage = text ?? ERROR_MESSAGE_UNKNOWN;
</script>

<div class="markup">
	<Message status="error">Error: {errorMessage}</Message>
</div>
