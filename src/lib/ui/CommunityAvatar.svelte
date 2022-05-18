<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';

	export let community: Readable<Community>;
	export let showName = true;
	export let showIcon = true;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;
</script>

<Avatar
	name={$community.name}
	type="Community"
	hue={$community.settings.hue}
	{showName}
	{showIcon}
	contextmenuAction={contextmenuAction === undefined
		? [[CommunityContextmenu, {community}]]
		: contextmenuAction}
/>
