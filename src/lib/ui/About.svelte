<script lang="ts">
	import {VITE_GIT_HASH} from '$lib/config';
</script>

<div class="markup">
	<h1>About this instance</h1>
	<p class="title">
		💚
		<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
			>felt-server</a
		>
		version
		<a href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}" target="_blank">
			{VITE_GIT_HASH}
		</a>
	</p>
	<p>
		Questions, comments, concerns? Email us at <a href="mailto:team@felt.social">team@felt.social</a
		>
	</p>
</div>
