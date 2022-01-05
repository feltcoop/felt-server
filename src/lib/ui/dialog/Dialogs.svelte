<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import type {Readable} from 'svelte/store';

	import {components} from '$lib/app/components';
	import type {DialogState} from '$lib/ui/dialog/dialog';

	export let dialogs: Readable<DialogState[]>;

	let activeDialog: DialogState | undefined;
	$: activeDialog = $dialogs[$dialogs.length - 1];
	$: Component = activeDialog && components[activeDialog.name];
	$: props = {}; // TODO
</script>

{#if activeDialog}
	<Dialog>
		<svelte:component this={Component} {...props} />
	</Dialog>
{/if}
