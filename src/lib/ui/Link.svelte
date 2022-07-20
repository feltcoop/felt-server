<script lang="ts">
	export let href: string;

	$: external = !(href.startsWith('/') || href.startsWith('.'));
	$: rel = external ? 'noreferrer' : undefined;
	$: target = external ? '_blank' : undefined;
</script>

<a {...$$restProps} {href} {rel} {target}><slot /></a>
