<script lang="ts">
	import type {File} from '$lib/vocab/file/file.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import ForumItem from '$lib/ui/ForumItem.svelte';

	// TODO this should possibly be a generic component instead of this named one

	export let files: File[];
	export let membersById: Map<number, Member>;

	// TODO refactor
	const toMember = (actor_id: number): Member => {
		const member = membersById.get(actor_id);
		if (!member) throw Error(`Unknown actor ${actor_id}`);
		return member;
	};
</script>

<!-- TODO possibly remove the `ul` wrapper and change the `li`s to `div`s -->
<ul>
	{#each files as file (file.file_id)}
		<ForumItem {file} member={toMember(file.actor_id)} />
	{/each}
</ul>
