<script lang="ts">
	import {session} from '$app/stores';

	import AccountForm from '$lib/ui/AccountForm.svelte';
</script>

<li role="none">
	<AccountForm guest={$session.guest} />
</li>
