<script lang="ts">
	import {session} from '$app/stores';
	import AccountForm from '$lib/ui/AccountForm.svelte';
</script>

<AccountForm guest={$session.guest} />
