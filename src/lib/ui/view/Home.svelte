<script lang="ts">
	import {browser} from '$app/env';
	import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import Forum from '$lib/ui/view/Forum.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import EntityContent from '$lib/ui/EntityContent.svelte';

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

	//TODO this is all done because the Query event always returns an empty array on initial call
	$: entitiesResult = shouldLoadEntities
		? dispatch.ReadEntities({source_id: $space.directory_id})
		: null;
	let entities: Entity[] | undefined;
	let rules: Readable<Entity> | undefined;
	let norms: Readable<Entity> | undefined;

	$: void entitiesResult?.then((data) => {
		if (data.ok) {
			entities = data.value.entities;
			rules = writable(entities.find((e) => e.data.name === 'rules'));
			norms = writable(entities.find((e) => e.data.name === 'norms'));
		}
	});

	const createEntity = async (text: string, name: string) => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await dispatch.CreateEntity({
			data: {type: 'Article', content, name},
			persona_id: $persona.persona_id,
			source_id: $space.directory_id,
		});
	};

	$: if (entities) {
		const result = entities.filter((e) => e.data.name === 'rules' || e.data.name === 'norms');
		if (result.length === 0) {
			void createEntity(DEFAULT_RULES, 'rules');
			void createEntity(DEFAULT_NORMS, 'norms');
		}
	}
</script>

<div class="home">
	<section class="markup padded-xl">
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
		<div class="rules markup padded-xl panel-inset">
			<div class="header">
				<h4>rules</h4>
				<!--TODO how to trigger a directory freshen from result of this dialogue-->
				<button
					on:click={() =>
						dispatch.OpenDialog({
							Component: EntityEditor,
							props: {entity: rules},
							dialogProps: {layout: 'page'},
						})}
					>propose change ✍️
				</button>
			</div>
			{#if rules && $rules}<EntityContent entity={rules} />{:else}rules not found{/if}
		</div>
		<div class="norms markup padded-xl panel-inset">
			<div class="header">
				<h4>norms</h4>
				<button
					on:click={() =>
						dispatch.OpenDialog({
							Component: EntityEditor,
							props: {entity: norms},
							dialogProps: {layout: 'page'},
						})}
					>propose change ✍️
				</button>
			</div>
			{#if norms && $norms}<EntityContent entity={norms} />{:else}norms not found{/if}
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
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
	}

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
