<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({space} = $viewContext);
</script>

TODO voice -- {$space.name}
