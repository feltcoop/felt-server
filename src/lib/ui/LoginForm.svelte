<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	let username = '';
	let password = '';
	let usernameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !!submitting;

	const login = async () => {
		if (submitting) return;
		if (!username) {
			usernameEl.focus();
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
		const result = await dispatch('LoginAccount', {username, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			passwordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeypress = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await login();
		}
	};
</script>

<div class="icon">
	<img src="/favicon.png" alt="felt heart" />
</div>
<form>
	<input
		bind:this={usernameEl}
		bind:value={username}
		on:keypress={onKeypress}
		{disabled}
		placeholder="account name"
		use:autofocus
		autocomplete="username"
	/>
	<input
		type="password"
		bind:this={passwordEl}
		bind:value={password}
		on:keypress={onKeypress}
		{disabled}
		placeholder="password"
		autocomplete="current-password"
	/>
	<PendingButton pending={!!submitting} bind:el={buttonEl} type="button" on:click={login}>
		log in
	</PendingButton>
	<div class:error={!!errorMessage}>{errorMessage || '💚'}</div>
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
