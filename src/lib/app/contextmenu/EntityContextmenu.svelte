<script lang="ts">
	import {type Entity} from '$lib/vocab/entity/entity';
	import {type Readable} from 'svelte/store';

	export let entity: Readable<Entity>;
</script>

<div class="markup">
	<p>TODO use entity_id: {$entity.entity_id}</p>
</div>
