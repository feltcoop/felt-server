<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {AsyncStatus} from '@feltcoop/felt';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {autofocus} from '$lib/ui/actions';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	let status: AsyncStatus = 'initial'; // TODO refactor
	let submitted = false;
	let errorMessage: string | null = null;

	//TODO refactor to build form from stored collection of questions stored as entities
	let q1 = '';
	let q2 = '';
	let q3 = '';
	let q1El: HTMLInputElement;
	let q2El: HTMLInputElement;
	let q3El: HTMLInputElement;

	const submit = async () => {
		//TODO validate inputs
		errorMessage = '';
		status = 'pending';
		q1 = q1.trim();
		q2 = q2.trim();
		q3 = q3.trim();
		if (!q1) {
			errorMessage = 'please answer all questions';
			q1El.focus();
			status = 'initial';
			return;
		}
		if (!q2) {
			errorMessage = 'please answer all questions';
			q2El.focus();
			status = 'initial';
			return;
		}
		if (!q3) {
			errorMessage = 'please answer all questions';
			q3El.focus();
			status = 'initial';
			return;
		}
		//TODO actually submit a form to the server for downstream review
		status = 'success';
		submitted = true;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await submit();
		}
	};
</script>

<section class="panel-inset">
	<!-- TODO fix CommunityAvatar on newline-->
	<div class="title">
		<h4>
			📝 Sign up for <CommunityAvatar {community} showName={true} contextmenuAction={null} />
		</h4>
	</div>
</section>
{#if !submitted}
	<form>
		<section class="panel-inset">
			<div class="question">
				<h4>How did you find this community (& if you were invited to join, who invited you?)</h4>
			</div>
			<input
				placeholder="> answer"
				bind:this={q1El}
				bind:value={q1}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		</section>

		<section class="panel-inset">
			<div class="question">
				<h4>Why would you like to join this community?</h4>
			</div>
			<input
				placeholder="> answer"
				bind:this={q2El}
				bind:value={q2}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		</section>

		<section class="panel-inset">
			<div class="question">
				<h4>These are the norms of our community, how do you think you can contribute?</h4>
				<!--TODO discuss a good way to reference the "rules" entity in another space-->
			</div>
			<input
				placeholder="> answer"
				bind:this={q3El}
				bind:value={q3}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		</section>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<PendingButton on:click={submit} pending={status === 'pending'}>Submit</PendingButton>
	</form>
{:else}
	<section class="panel-inset">
		<div class="question">
			<h4>
				Thank you for submitting! We will review your application and get back to you within a week.
				This process takes time because we want to ensure you and our community are a good fit.
			</h4>
		</div>
	</section>
{/if}

<style>
	.panel-inset {
		margin-top: var(--spacing_xl);
		margin-left: var(--spacing_xl);
		margin-right: var(--spacing_xl);
	}
	.title {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		min-height: 50px;
		--icon_size: var(--icon_size_sm);
	}
	.question {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		min-height: 50px;
	}
</style>
