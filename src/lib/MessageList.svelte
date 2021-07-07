<script lang="ts">
	import type {MessageState} from '$lib/messagesStore.js';

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
