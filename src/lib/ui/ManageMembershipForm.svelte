<script lang="ts">
	import {get} from 'svelte/store';
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import type {Community} from '$lib/vocab/community/community';

	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
		ui: {selectedPersona, communities},
	} = getApp();

	let persona = $selectedPersona!;

	if (persona) {
		$persona.community_ids;
	}

	let opened = false;
	let errorMessage: string | undefined;

	const getCommunity = (community_id: number): Community =>
		get($communities.find((c) => get(c).community_id === community_id)!);

	const leaveCommunity = async (community_id: number) => {
		errorMessage = '';
		const result = await dispatch('delete_membership', {
			persona_id: $persona.persona_id,
			community_id,
		});
		if (result.ok) {
			opened = false;
		} else {
			errorMessage = result.reason;
		}
	};
</script>

<button
	aria-label="Delete Space"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	Manage Memberships
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
		<div class="markup">
			<h1>Manage community memberships</h1>
			<form>
				<div class:error={!!errorMessage}>{errorMessage || ''}</div>
				{#each $persona.community_ids as community_id (community_id)}
					<div class="community-badge">
						<button type="button" on:click={leaveCommunity(community_id)}> 👋 </button>
						{getCommunity(community_id).name}
					</div>
				{/each}
			</form>
		</div>
	</Dialog>
{/if}

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
	.community-badge {
		display: flex;
		font-size: xx-large;
	}
</style>
