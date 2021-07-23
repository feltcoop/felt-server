<script lang="ts">
	import {session} from '$app/stores';

	import Login_Form from '$lib/ui/Login_Form.svelte';
	import Logout_Form from '$lib/ui/Logout_Form.svelte';

	$: console.log('<Account_Form> $session', $session);
</script>

{#if $session.guest}
	<Login_Form />
{:else}
	<Logout_Form />
{/if}
