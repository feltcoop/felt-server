<script lang="ts">
	import {setSpaceIdSelectionByCommunityId, type Ui} from '$lib/ui/ui';

	export let ui: Ui;

	// TODO maybe refactor this, so each value is self contained and can be persisted on its own?

	$: ({spaceIdSelectionByCommunityId} = ui);

	$: setSpaceIdSelectionByCommunityId(Array.from($spaceIdSelectionByCommunityId.value.entries()));
</script>
