<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	// TODO strip any local url prefix
	$: value = $contextmenu.items.LinkContextmenu;
</script>

<!-- TODO could do more if we had the original `target` element
							(but it might go stale on $contextmenu?) -->
<!-- TODO if it's an external link, add target="_blank" -->
<a href={value}>
	<span class="icon">🔗</span>
	{value}
</a>

<style>
	a {
		display: flex;
		align-items: center;
		width: 100%;
		word-break: break-word;
	}
	.icon {
		display: flex;
		font-size: var(--icon_size_sm);
		padding: var(--spacing_sm);
	}
</style>
