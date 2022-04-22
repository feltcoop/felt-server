<script lang="ts">
	import {browser} from '$app/env';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import Forum from '$lib/ui/view/Forum.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {get} from 'svelte/store';

	const viewContext = getViewContext();
	$: ({community, space, persona} = $viewContext);

	const {
		ui: {personasByCommunityId},
		socket,
		dispatch,
	} = getApp();

	const DEFAULT_RULES = `<ol>
				<li>
					No tolerance for any sort of hate and discrimination such as racism, sexism, ableism,
					transphobia, etc.
				</li>
				<li>No spamming</li>
				<li>If there is a conflict, please report issues to community leaders</li>
			</ol>`;

	const DEFAULT_NORMS = `<p>
				some thoughts about our community’s vibes that aren’t rules, but still worth thinking about
			</p>
			<ol>
				<li>We welcome nerdiness :)</li>
				<li>We strive to learn from each other.</li>
				<li>We encourage everyone to participate in moderation.</li>
			</ol>`;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;
	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch.QueryEntities({space_id: $space.space_id}) : null;

	const createEntity = async (text: string, name: string) => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await dispatch.CreateEntity({
			space_id: $space.space_id,
			data: {type: 'Article', content, name},
			actor_id: $persona.persona_id,
			source_id: $space.directory_id,
		});
	};

	$: console.log('should load', shouldLoadEntities);
	$: console.log('checking entities');
	$: if ($entities) {
		console.log('array exists', $entities);
		const result = $entities.filter(
			(e) => get(e).data.name === 'rules' || get(e).data.name === 'norms',
		);
		console.log('array with rules &  norms', result);
		// if (result.length === 0) {
		// 	void createEntity(DEFAULT_RULES, 'rules');
		// 	void createEntity(DEFAULT_NORMS, 'norms');
		// }
	}
</script>

<div class="home">
	<section class="markup">
		<p>
			<strong>
				Check out our community rules and norms!<br />
				Please feel free to voice your thoughts about them. Deliberation is always helpful for maintaining
				a healthy community.
			</strong>
		</p>

		<p>
			You can also check out other communities’ governance structures here (limited to those that
			are public). You can fork other types of governance here.
		</p>
	</section>
	<section class="rules-and-norms">
		<div class="rules markup panel-inset">
			<h4>rules</h4>
			{@html DEFAULT_RULES}
		</div>
		<div class="norms markup panel-inset">
			<h4>norms</h4>
			{@html DEFAULT_NORMS}
		</div>
	</section>
	<section class="roles">
		<div class="panel-inset">
			<h4>roles</h4>
			<ul>
				<li>
					<span class="role-name">member</span>
					<ul class="role-members">
						{#each communityPersonas as persona (persona)}
							<li><PersonaAvatar {persona} showIcon={false} /></li>
						{/each}
					</ul>
				</li>
			</ul>
		</div>
	</section>
	<Forum />
</div>

<style>
	.rules-and-norms {
		display: flex;
	}
	.rules,
	.norms {
		flex: 1;
		min-height: 200px;
		margin-left: var(--spacing_xl);
		margin-right: var(--spacing_xl);
	}

	.norms {
		margin-left: 0;
	}

	.roles {
		margin: var(--spacing_xl);
	}
	.roles .panel-inset {
		padding: var(--spacing_xl);
	}
	.role-name {
		font-weight: 600;
		margin-right: var(--spacing_md);
	}
	.role-members {
		display: flex;
		flex-direction: row;
		flex: 1;
		flex-wrap: wrap;
	}
	.role-members li {
		margin-right: var(--spacing_md);
	}
</style>
