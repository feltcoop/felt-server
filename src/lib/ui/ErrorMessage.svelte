<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error';

	export let text: string | undefined;

	$: errorMessage = text ?? ERROR_MESSAGE_UNKNOWN;
</script>

<div class="markup">
	<Message status="error">Error: {errorMessage}</Message>
</div>
