<script lang="ts">
	import type {Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceName from '$lib/ui/SpaceName.svelte';

	const {dispatch} = getApp();

	export let space: Readable<Space>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;

	const deleteSpace = async () => {
		errorMessage = '';
		const result = await dispatch('DeleteSpace', {
			space_id: $space.space_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await deleteSpace();
		}
	};
</script>

<div class="markup">
	<h1>Delete Space?</h1>
	<section class="space">
		<SpaceName {space} />
		<!-- TODO `PersonaAvatar` and `CommunityAvatar`
			<Avatar name={toName($persona)} icon={toIcon($persona)} />
			<Avatar name={$community.name} type="Community" />
		-->
	</section>
	<form>
		<div class:error={!!errorMessage}>{errorMessage || ''}</div>
		<button type="button" on:click={deleteSpace} on:keydown={onKeydown}> Delete space </button>
	</form>
</div>

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	.space {
		display: flex;
		align-items: center;
		font-size: var(--font_size_xl);
	}
</style>
