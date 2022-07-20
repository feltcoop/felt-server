<script lang="ts">
	export let href: string;

	$: external = !(href.startsWith('/') || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
</script>

<!-- TODO maybe user `sveltekit:prefetch` for internal links -->
<a {...$$restProps} {href} {rel} {target}><slot /></a>
