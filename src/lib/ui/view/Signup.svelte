<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	let status: AsyncStatus = 'initial'; // TODO refactor
	let errorMessage: string | null = null;

	//TODO refactor to build form from stored collection of questions
	let q1 = '';
	let q2 = '';
	let q3 = '';
	let q1El, q2El, q3El: HTMLInputElement;

	const submit = async () => {
		console.log('hello');
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await submit();
		}
	};
</script>

<section class="panel-inset">
	<!-- TODO BLOCK CommunityAvatar ends up on newline-->
	<div class="title">
		<h4>
			📝 Sign up for <CommunityAvatar {community} showName={true} contextmenuAction={null} />
		</h4>
	</div>
</section>
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
	<PendingButton on:click={submit} pending={status === 'pending'}>Submit</PendingButton>
</form>

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
	/*TODO BLOCK how to get question insets to 100% */
	.question {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		min-height: 50px;
	}
</style>
