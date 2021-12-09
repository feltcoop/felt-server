<!-- TODO see usage -- what role does this component play? -->

<div class="context-menu pane" role="menu" aria-modal tabindex="-1">
	<!-- TODO automatically populate with entity commands -->
	<slot />
</div>

<style>
	.context-menu {
		/* TODO should this be `pane-light` or something?
		The `pane` shadow is too heavy because it's designed
		for contrast against a fullscreen darkened background. */
		--pane_box_shadow: 0px 2px 10px hsla(0, 100%, 0%, 0.2);
		border: var(--border);
	}
</style>
