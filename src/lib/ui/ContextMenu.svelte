<!-- TODO see usage -- what role does this component play? -->

<div class="context-menu" role="menu" aria-modal tabindex="-1">
	<!-- TODO automatically populate with entity commands -->
	<slot />
</div>

<style>
	.context-menu {
		/* TODO use `.pane` class from Felt when published */
		background: #fff;
		border: 2px solid black;
	}
</style>
