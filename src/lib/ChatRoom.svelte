<script lang="ts">
	import {browser} from '$app/env';
	import type {Space} from '../spaces/space.js';
	import PostList from '$lib/PostList.svelte';
	import {posts} from '$lib/postStore';
	import type {Json} from '@feltcoop/gro/dist/utils/json.js';
	import type {SocketStore} from './socketStore.js';
	import {getContext} from 'svelte';

	const socket: SocketStore = getContext('socket');

	export let space: Space;
	export let text = '';
	$: browser && loadPosts(space.space_id);
	$: console.log(`[chatRoom] fetching posts for ${space.space_id}`);

	const loadPosts = async (spaceId: number) => {
		const res = await fetch(`/api/v1/spaces/${spaceId}/posts`);
		if (res.ok) {
			const data = await res.json();
			$posts = data.posts;
		}
	};

	const createPost = async () => {
		if (!text) return;
		const res = await fetch(`/api/v1/spaces/${space.space_id}/posts`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({content: text}),
		});
		if (res.ok) {
			console.log('post sent, broadcasting to server');
			const data = await res.json();
			broadcastPost(data);
		} else {
			console.error('error sending post');
		}
		text = '';
	};

	const broadcastPost = async (data: Json) => {
		if (!$socket.connected) {
			console.error('expected socket to be connected to chat');
			return;
		}
		// TODO the type of message created here does *not* include fields like `id`, `attributedTo`, etc - these are added by the server
		// TODO this should create a client-side tracking object that we can monitor, cancel, organize, etc
		socket.send(data);
	};

	const onKeyDown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createPost();
		}
	};
</script>

<div class="chatRoom">
	<input type="text" placeholder="> chat" on:keydown={onKeyDown} bind:value={text} />
	<PostList posts={$posts} />
</div>

<style>
	.chatRoom {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
