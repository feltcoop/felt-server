<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import type {Readable} from 'svelte/store';

	import type {DialogState} from '$lib/ui/dialog/dialog';

	// TODO upstream to Felt

	export let dialogs: Readable<DialogState[]>;

	let activeDialog: DialogState | undefined;
	$: activeDialog = $dialogs[$dialogs.length - 1];
</script>

{#if activeDialog}
	<!-- TODO should 'CloseDialog' take the dialog object or an id? -->
	<Dialog on:close>
		<svelte:component this={activeDialog.Component} {...activeDialog.props} />
	</Dialog>
{/if}
