<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from 'svelte/store';
	import {type SvelteComponent} from 'svelte';

	import type {DialogState} from '$lib/ui/dialog/dialog';
	import {getApp} from '$lib/ui/app';

	export let dialogs: Readable<DialogState[]>;
	export let components: {[key: string]: typeof SvelteComponent};

	const {dispatch} = getApp();

	let activeDialog: DialogState | undefined;
	$: activeDialog = $dialogs[$dialogs.length - 1];
	$: Component = activeDialog && components[activeDialog.name];
</script>

{#if activeDialog}
	<!-- TODO should 'CloseDialog' take the dialog object or an id? -->
	<Dialog on:close={() => dispatch('CloseDialog')}>
		{#if Component}
			<svelte:component this={Component} {...activeDialog.props} />
		{:else}
			<div class="markup">
				<Message status="error">unknown component "{activeDialog.name}"</Message>
			</div>
		{/if}
	</Dialog>
{/if}
