<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	$: value = $contextmenu.items.EntityContextmenu;
</script>

<div class="markup">
	<p>TODO use entity_id: {value}</p>
</div>
