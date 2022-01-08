<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {session} from '$app/stores';
	import AccountForm from '$lib/ui/AccountForm.svelte';

	export const contextmenu: ContextmenuStore = undefined as any;
</script>

<AccountForm guest={$session.guest} />
