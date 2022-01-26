<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {type Entity} from '$lib/vocab/entity/entity';

	export const contextmenu: ContextmenuStore = undefined as any;
	export let entity: Readable<Entity>;
</script>

<li role="none" class="markup">
	<p>TODO use entity_id: {$entity.entity_id}</p>
</li>
