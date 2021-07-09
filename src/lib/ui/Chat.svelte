<script lang="ts">
	import MessageList from '$lib/ui/Message_List.svelte';
	import {messages} from '$lib/ui/messages_store';
	import type {SocketStore} from '$lib/ui/socket_store.js';

	export let socket: SocketStore;

	let text = '';

	const createChatMessage = () => {
		if (!$socket.connected) {
			console.error('expected socket to be connected to chat');
			return;
		}
		if (!text) return;
		// TODO the type of message created here does *not* include fields like `id`, `attributedTo`, etc - these are added by the server
		// TODO this should create a client-side tracking object that we can monitor, cancel, organize, etc
		socket.send({type: 'Create', object: {type: 'Message', content: text}});
		text = '';
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			createChatMessage();
		}
	};
</script>

<div class="Chat">
	<input type="text" placeholder="> chat" on:keydown={onKeyDown} bind:value={text} />
	<MessageList messages={$messages} />
</div>

<style>
	.Chat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
