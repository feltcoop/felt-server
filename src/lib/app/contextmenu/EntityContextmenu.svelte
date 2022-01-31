<script lang="ts">
	import {type Readable} from 'svelte/store';

	import {type Entity} from '$lib/vocab/entity/entity';

	export let entity: Readable<Entity>;
</script>

<li role="none" class="markup">
	<p>TODO use entity_id: {$entity.entity_id}</p>
</li>
