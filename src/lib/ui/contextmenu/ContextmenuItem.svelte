<script lang="ts">
	//
</script>

<!-- TODO should be <a> ? 
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
how to handle the fact that they shouldn't receive focus? disable `Tab`?
-->
<button type="button" class="menu-button" role="menu" on:click>
	<slot />
</button>
