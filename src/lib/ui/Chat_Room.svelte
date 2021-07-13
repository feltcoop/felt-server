<script lang="ts">
	import {browser} from '$app/env';
	import type {Json} from '@feltcoop/felt/util/json.js';
	import {getContext} from 'svelte';

	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';
	import Post_List from '$lib/ui/Post_List.svelte';
	import {posts} from '$lib/ui/post_store';
	import type {Socket_Store} from '$lib/ui/socket_store.js';

	const socket: Socket_Store = getContext('socket');

	export let space: Space;
	export let members: Member[];
	export let text = '';
	$: browser && load_posts(space.space_id);
	$: console.log(`[chat_room] fetching posts for ${space.space_id}`);

	const load_posts = async (space_id: number) => {
		const res = await fetch(`/api/v1/spaces/${space_id}/posts`);
		if (res.ok) {
			const data = await res.json();
			$posts = data.posts;
		}
	};

	const create_post = async () => {
		if (!text) return;
		const res = await fetch(`/api/v1/spaces/${space.space_id}/posts`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({content: text}),
		});
		if (res.ok) {
			console.log('post sent, broadcasting to server');
			const data = await res.json();
			broadcast_post(data);
		} else {
			console.error('error sending post');
		}
		text = '';
	};

	const broadcast_post = async (data: Json) => {
		if (!$socket.connected) {
			console.error('expected socket to be connected to chat');
			return;
		}
		// TODO the type of message created here does *not* include fields like `id`, `attributed_to`, etc - these are added by the server
		// TODO this should create a client-side tracking object that we can monitor, cancel, organize, etc
		socket.send(data);
	};

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create_post();
		}
	};
</script>

<div class="chat-room">
	<Post_List posts={$posts} {members} />
	<input type="text" placeholder="> chat" on:keydown={on_keydown} bind:value={text} />
</div>

<style>
	.chat-room {
		display: flex;
		flex-direction: column;
		align-items: left;
	}
</style>
