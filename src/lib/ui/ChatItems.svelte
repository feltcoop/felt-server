<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import ChatItem from '$lib/ui/ChatItem.svelte';

	export let files: File[];
	export let members_by_id: Map<number, Member>;

	// TODO refactor
	const to_member = (actor_id: number): Member => {
		const member = members_by_id.get(actor_id);
		if (!member) throw Error(`Unknown actor ${actor_id}`);
		return member;
	};
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each files as file (file.file_id)}
		<ChatItem {file} member={to_member(file.actor_id)} />
	{/each}
</ul>
