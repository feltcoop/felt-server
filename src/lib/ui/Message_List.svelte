<script lang="ts">
	import type {MessageState} from '$lib/ui/messages_store.js';

	export let messages: MessageState[];
</script>

<ul>
	{#each messages as message (message.id)}
		<li>
			<small>{message.attributedTo}</small>:
			{message.object.content}
		</li>
	{/each}
</ul>
