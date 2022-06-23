<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';

	const viewContext = getViewContext();
	$: ({community, space, persona} = $viewContext);
</script>

<section class="panel-inset">
	<div class="title">
		<h4>
			📝 Sign up for <CommunityAvatar {community} showName={true} contextmenuAction={null} />
		</h4>
	</div>
</section>

<section class="panel-inset">
	<div class="question">
		<h4>How did you find this community (& if you were invited to join, who invited you?)</h4>
	</div>
</section>

<section class="panel-inset">
	<div class="question">
		<h4>Why would you like to join this community?</h4>
	</div>
</section>

<section class="panel-inset">
	<div class="question">
		<h4>These are the norms of our community, how do you think you can contribute?</h4>
	</div>
</section>

<style>
	.panel-inset {
		margin-top: var(--spacing_xl);
		margin-left: var(--spacing_xl);
		margin-right: var(--spacing_xl);
	}
	.title {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		min-height: 50px;
		--icon_size: var(--icon_size_sm);
	}
	.question {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		min-height: 50px;
	}
</style>
