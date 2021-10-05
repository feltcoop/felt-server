<script lang="ts">
	import {eventsInfo} from '$lib/vocab/event/eventsInfo';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	const title = 'docs';
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<div class="column">
		<Markup>
			<h1>docs</h1>
			<hr />
			<h2>events</h2>
		</Markup>
		<ul>
			{#each eventsInfo as eventInfo (eventInfo.name)}
				<li>
					<div class="title">
						<code class="name">{eventInfo.name}</code>
						<small class="type">{eventInfo.type}</small>
					</div>
					<div class="property">
						<span>params</span>
						<pre>
            {eventInfo.params.type}
          </pre>
					</div>
					{#if eventInfo.type !== 'ClientEvent'}
						<div class="property">
							<span>response</span>
							<pre>
            {eventInfo.response.type}
          </pre>
						</div>
					{/if}
					<div class="property">
						<span>returns</span>
						<pre>
            {eventInfo.returns}
          </pre>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
	}
	.column {
		overflow: auto;
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_lg) 0;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.name {
		font-size: var(--font_size_lg);
		padding: var(--spacing_md);
	}
	.type {
		padding: var(--spacing_lg);
		background: none;
		font-family: var(--font_family_mono);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--tint_dark_1);
	}
	.property:nth-child(2n + 1) {
		background-color: var(--tint_dark_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
