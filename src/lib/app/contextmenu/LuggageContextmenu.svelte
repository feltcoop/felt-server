<script lang="ts">
	import {session} from '$app/stores';

	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export const contextmenu: ContextmenuStore = undefined as any;
</script>

<li role="none">
	<AccountForm guest={$session.guest} />
</li>
