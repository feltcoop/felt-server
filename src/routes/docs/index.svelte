<script lang="ts">
	import {page} from '$app/stores';

	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {eventInfos} from '$lib/app/events';
	import {vocabSchemas} from '$lib/app/schemas';

	const title = 'docs';

	$: hash = $page.url.hash.substring(1);

	// TODO use IntersectionObserver to update hash on scroll
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<div class="column">
		<div class="markup padded-xl">
			<h1 id="docs">docs</h1>
		</div>
		<!-- TODO extract an accessible menu component, see PRS
		https://github.com/feltcoop/felt-server/pull/362
		and https://github.com/feltcoop/felt/pull/197 -->
		<div class="menu-wrapper markup padded-xl column-sm">
			<ul class="menu">
				<li><h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3></li>
				<li><h4><a href="#vocab" class:selected={hash === 'vocab'}>vocab</a></h4></li>
				<ul>
					{#each vocabSchemas as schema (schema)}
						<li>
							<a href="#{schema.name}" class:selected={hash === schema.name}>{schema.name}</a>
						</li>
					{/each}
				</ul>
				<li><h4><a href="#events" class:selected={hash === 'events'}>events</a></h4></li>
				<ul>
					{#each eventInfos as eventInfo (eventInfo.name)}
						<li>
							<a href="#{eventInfo.name}" class:selected={hash === eventInfo.name}
								>{eventInfo.name}</a
							>
						</li>
					{/each}
				</ul>
			</ul>
		</div>
		<div class="markup padded-xl">
			<h2 id="vocab">vocab</h2>
		</div>
		<ul>
			{#each vocabSchemas as schema (schema)}
				<li id={schema.name}>
					<SchemaInfo {schema} />
				</li>
			{/each}
		</ul>
		<div class="markup padded-xl">
			<h2 id="events">events</h2>
		</div>
		<ul>
			{#each eventInfos as eventInfo (eventInfo.name)}
				<li id={eventInfo.name}>
					<div class="title">
						<code class="name">{eventInfo.name}</code>
						<small class="type">{eventInfo.type}</small>
					</div>
					<div class="property">
						<span>params</span>
						<!-- TODO display the generated type string instead of the schema,
						probably by generating a sibling file to `events.ts` like `eventTypeStrings.ts` -->
						<pre>{JSON.stringify(eventInfo.params, null, 2)}</pre>
					</div>
					{#if eventInfo.type !== 'ClientEvent'}
						<div class="property">
							<span>response</span>
							<!-- TODO display the generated type string instead of the schema,
							probably by generating a sibling file to `events.ts` like `eventTypeStrings.ts` -->
							<pre>{JSON.stringify(eventInfo.response, null, 2)}</pre>
						</div>
					{/if}
					<div class="property">
						<span>returns</span>
						<pre>{eventInfo.returns}</pre>
					</div>
				</li>
			{/each}
		</ul>
		<div class="markup padded-xl">
			<ul>
				<li><h3><a href="#docs" class:selected={hash === 'docs'}>docs</a></h3></li>
				<ul>
					<li>
						<h4>
							<a href="#vocab" class:selected={hash === 'vocab'}>vocab</a>
						</h4>
					</li>
					<li>
						<h4>
							<a href="#events" class:selected={hash === 'events'}>events</a>
						</h4>
					</li>
				</ul>
			</ul>
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		overflow: auto;
	}
	.column {
		position: relative;
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_lg) 0;
	}
	.menu li {
		padding: 0;
	}
	.menu-wrapper {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		transform: translate3d(calc(100% + 10px), 0, 0);
	}
	.menu {
		position: sticky;
		top: 0;
		padding: var(--spacing_sm);
	}
	@media (max-width: 1500px) {
		.menu-wrapper {
			position: relative;
			transform: none;
			margin-bottom: var(--spacing_xl3);
		}
	}
	.menu {
		position: sticky;
		right: 0;
		top: 0;
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
