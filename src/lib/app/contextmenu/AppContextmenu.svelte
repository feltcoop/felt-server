<script lang="ts">
	import {VITE_GIT_HASH} from '$lib/config';
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export const contextmenu: ContextmenuStore = undefined as any;
</script>

<div class="markup">
	<p>
		💚
		<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
			>felt-server</a
		>
		version
		<a href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}" target="_blank">
			{VITE_GIT_HASH}
		</a>
	</p>
</div>
