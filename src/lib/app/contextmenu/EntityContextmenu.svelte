<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	$: value = $contextmenu.entities!.entity;
</script>

<section class="markup panel-inset">
	<p>TODO use entity_id: {value}</p>
</section>
