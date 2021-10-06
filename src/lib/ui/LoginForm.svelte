<script lang="ts">
	import {tick} from 'svelte';
	import {icons} from '@feltcoop/felt';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
	} = getApp();

	let accountName = '';
	let password = '';
	let accountNameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !!submitting;

	const doLogIn = async () => {
		if (submitting) return;
		if (!accountName) {
			accountNameEl.focus();
			errorMessage = 'please enter an account name';
			return;
		}
		if (!password) {
			passwordEl.focus();
			errorMessage = 'please enter a password';
			return;
		}
		buttonEl.focus();
		submitting = true;
		errorMessage = '';
		console.log('logging in with accountName', accountName);
		const result = await dispatch('log_in', {accountName, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.reason;
			await tick();
			passwordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeypress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			doLogIn();
		}
	};
</script>

<div class="icon">
	<img src="/favicon.png" alt="felt heart" />
</div>
<form>
	<input
		bind:this={accountNameEl}
		bind:value={accountName}
		on:keypress={onKeypress}
		{disabled}
		placeholder="account name"
		use:autofocus
	/>
	<input
		type="password"
		bind:this={passwordEl}
		bind:value={password}
		on:keypress={onKeypress}
		{disabled}
		placeholder="password"
	/>
	<PendingButton pending={!!submitting} bind:el={buttonEl} type="button" on:click={doLogIn}>
		log in
	</PendingButton>
	<div class:error={!!errorMessage}>{errorMessage || icons.felt}</div>
</form>
<div class="centered-block">
	<div>
		<slot />
	</div>
</div>
<div class="centered-block">
	<div>
		<Message icon="🗝">your account name is private</Message>
	</div>
</div>

<style>
	.error {
		font-weight: bold;
		color: rgb(73, 84, 153);
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.icon {
		display: flex;
		justify-content: center;
		padding: var(--spacing_lg);
	}
	.icon img {
		width: var(--icon_size_md);
		height: var(--icon_size_md);
	}

	.centered-block {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
