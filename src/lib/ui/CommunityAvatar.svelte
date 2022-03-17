<script lang="ts">
	import type {Readable} from 'svelte/store';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';

	export let community: Readable<Community>;
	export let showName = true;
	export let showIcon = true;
</script>

<Avatar
	name={$community.name}
	type="Community"
	{showName}
	{showIcon}
	contextmenuAction={[[CommunityContextmenu, {community}]]}
/>
