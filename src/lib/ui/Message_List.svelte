<script lang="ts">
	import type {Message_State} from '$lib/ui/messages_store.js';

	export let messages: Message_State[];
</script>

<ul>
	{#each messages as message (message.id)}
		<li>
			<small>{message.attributed_to}</small>:
			{message.object.content}
		</li>
	{/each}
</ul>
