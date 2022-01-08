<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	$: value = $contextmenu.entities!.entity;
</script>

<p>TODO use entity_id: {value}</p>
