<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	$: value = $contextmenu.entities!.space;
</script>

<h3>{value}</h3>
