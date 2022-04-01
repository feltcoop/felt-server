<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import Forum from './Forum.svelte';
	import PersonaAvatar from '../PersonaAvatar.svelte';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	const {
		ui: {personasByCommunityId},
	} = getApp();

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;
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
			<ol>
				<li>
					No tolerance for any sort of hate and discrimination such as racism, sexism, ableism,
					transphobia, etc.
				</li>
				<li>No spams</li>
				<li>If there is a conflict, we have a conflict resolution process where...</li>
			</ol>
		</div>
		<div class="norms markup panel-inset">
			<h4>norms</h4>

			<p>
				some thoughts about our community’s vibes that aren’t rules, but still worth thinking about
			</p>

			<ol>
				<li>We welcome nerdiness :)</li>
				<li>We strive to learn from each other.</li>
				<li>We encourage everyone to participate in moderation.</li>
			</ol>
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
	}
	.role-members li {
		margin-right: var(--spacing_md);
	}
</style>
