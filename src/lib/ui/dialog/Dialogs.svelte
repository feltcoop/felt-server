<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import type {Readable} from 'svelte/store';

	import {components} from '$lib/app/components';
	import type {DialogState} from '$lib/ui/dialog/dialog';
	import {getApp} from '$lib/ui/app';

	export let dialogs: Readable<DialogState[]>;

	const {dispatch} = getApp();

	let activeDialog: DialogState | undefined;
	$: activeDialog = $dialogs[$dialogs.length - 1];
	$: Component = activeDialog && components[activeDialog.name];
</script>

{#if activeDialog}
	<!-- TODO should 'CloseDialog' take the dialog object or an id? -->
	<Dialog on:close={() => dispatch('CloseDialog')}>
		<svelte:component this={Component} {...activeDialog.props} />
	</Dialog>
{/if}
