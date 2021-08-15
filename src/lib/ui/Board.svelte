<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';
	import Board_Items from '$lib/ui/Board_Items.svelte';
	import {posts} from '$lib/ui/post_store';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let space: Space;
	export let members_by_id: Map<number, Member>;

	let text = '';

	$: browser && load_posts(space.space_id);
	$: console.log(`[Board] fetching posts for ${space.space_id}`);

	// TODO refactor
	const load_posts = async (space_id: number) => {
		$posts = [];
		const res = await fetch(`/api/v1/spaces/${space_id}/posts`);
		if (res.ok) {
			const data = await res.json();
			$posts = data.posts;
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
</script>

<div class="board">
	<textarea placeholder="> post" on:keydown={on_keydown} bind:value={text} />
	<div class="posts">
		<Board_Items posts={$posts} {members_by_id} />
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
