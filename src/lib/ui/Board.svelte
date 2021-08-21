<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';
	import BoardItems from '$lib/ui/BoardItems.svelte';
	import {get_app} from '$lib/ui/app';

	const {api, data} = get_app();

	export let space: Space;
	export let members_by_id: Map<number, Member>;

	let text = '';

	$: browser && load_posts(space.space_id);
	$: console.log(`[Board] fetching posts for ${space.space_id}`);

	// TODO refactor
	const load_posts = async (space_id: number) => {
		data.set_posts(space_id, []);
		const res = await fetch(`/api/v1/spaces/${space_id}/posts`);
		if (res.ok) {
			const json = await res.json();
			data.set_posts(space_id, json.posts);
		}
	};

	const create_post = async () => {
		if (!text) return;
		await api.create_post(space, text);
		text = '';
	};

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create_post();
		}
	};

	$: posts = $data.posts_by_space[space.space_id] || [];
</script>

<div class="board">
	<textarea placeholder="> post" on:keydown={on_keydown} bind:value={text} />
	<div class="posts">
		<BoardItems {posts} {members_by_id} />
	</div>
</div>

<style>
	.board {
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
		flex-direction: column;
	}
	textarea {
		border-left: none;
		border-right: none;
		border-bottom: none;
		border-radius: 0;
	}
</style>
