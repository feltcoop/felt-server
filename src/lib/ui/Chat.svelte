<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import ChatItems from '$lib/ui/ChatItems.svelte';
	import {get_app} from '$lib/ui/app';

	const {api, ui, data} = get_app();

	export let space: Space;
	export let members_by_id: Map<number, Member>;

	let text = '';

	$: browser && api.load_posts(space.space_id);
	$: console.log(`[Chat] fetching posts for ${space.space_id}`);
	$: selected_persona_id = $ui.selected_persona_id;

	const create_post = async () => {
		if (!text) return;
		await api.create_post(space, text, selected_persona_id!);
		text = '';
	};

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create_post();
		}
	};

	$: posts = $data.posts_by_space[space.space_id] || [];
</script>

<div class="chat">
	<div class="posts">
		<ChatItems {posts} {members_by_id} />
	</div>
	<input type="text" placeholder="> chat" on:keydown={on_keydown} bind:value={text} />
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.posts {
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
	input {
		border-left: none;
		border-right: none;
		border-bottom: none;
		border-radius: 0;
	}
</style>
