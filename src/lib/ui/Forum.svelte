<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';
	import ForumItems from '$lib/ui/ForumItems.svelte';
	import {get_app} from '$lib/ui/app';

	const {api, data} = get_app();

	export let space: Space;
	export let members_by_id: Map<number, Member>;

	let text = '';

	$: browser && api.load_posts(space.space_id);
	$: console.log(`[Forum] fetching posts for ${space.space_id}`);

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

<div class="forum">
	<textarea placeholder="> new topic" on:keydown={on_keydown} bind:value={text} />
	<div class="posts">
		<ForumItems {posts} {members_by_id} />
	</div>
</div>

<style>
	.forum {
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
		border-top: none;
		border-radius: 0;
	}
</style>
