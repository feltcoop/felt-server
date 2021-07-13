<script lang="ts">
	import Message_List from '$lib/ui/Message_List.svelte';
	import {messages} from '$lib/ui/messages_store';
	import type {Socket_Store} from '$lib/ui/socket_store.js';

	export let socket: Socket_Store;

	let text = '';

	const create_chat_message = () => {
		if (!$socket.connected) {
			console.error('expected socket to be connected to chat');
			return;
		}
		if (!text) return;
		// TODO the type of message created here does *not* include fields like `id`, `attributed_to`, etc - these are added by the server
		// TODO this should create a client-side tracking object that we can monitor, cancel, organize, etc
		socket.send({type: 'Create', object: {type: 'Message', content: text}});
		text = '';
	};

	const on_keydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			create_chat_message();
		}
	};
</script>

<div class="chat">
	<input type="text" placeholder="> chat" on:keydown={on_keydown} bind:value={text} />
	<Message_List messages={$messages} />
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
