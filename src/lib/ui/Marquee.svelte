<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {toIcon, toName} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';

	const {
		ui: {contextmenu, expandMarquee, personasById},
		socket,
		devmode,
	} = getApp();

	export let community: Readable<Community>;
	export let space: Readable<Space | null>;
</script>

<MarqueeNav {community} {space} />

<!-- TODO display other meta info about the community -->
{#if $expandMarquee}
	<section>
		<ul>
			<!-- TODO probably want these to be sorted so the selected persona is always first -->
			{#each $community.memberPersonas as persona (persona.persona_id)}
				<!-- TODO this is going to change to a store, won't need the inefficient lookup -->
				<li
					use:contextmenu.action={[
						[PersonaContextmenu, {persona: personasById.get(persona.persona_id)}],
					]}
				>
					<Avatar name={toName(persona)} icon={toIcon(persona)} />
				</li>
			{/each}
		</ul>
	</section>
	{#if $devmode}
		<section>
			<ul>
				<li><a href="/docs">/docs</a></li>
			</ul>
		</section>
		<section>
			<SocketConnection {socket} />
		</section>
	{/if}
{/if}
