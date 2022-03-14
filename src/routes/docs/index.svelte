<script lang="ts">
	import SchemaInfo from '$lib/ui/SchemaInfo.svelte';
	import {eventInfos} from '$lib/app/events';
	import {schemas} from '$lib/app/schemas';

	const title = 'docs';
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<div class="column">
		<div class="markup">
			<h1 id="docs">docs</h1>
			<ul>
				<li><a href="#vocab">vocab</a></li>
				<li><a href="#events">events</a></li>
			</ul>
			<hr />
			<h2 id="vocab">vocab</h2>
		</div>
		<ul>
			{#each schemas as schema (schema)}
				<li>
					<SchemaInfo {schema} />
				</li>
			{/each}
		</ul>
		<hr />
		<div class="markup">
			<h2 id="events">events</h2>
		</div>
		<ul>
			{#each eventInfos as eventInfo (eventInfo.name)}
				<li>
					<div class="title">
						<code class="name">{eventInfo.name}</code>
						<small class="type">{eventInfo.type}</small>
					</div>
					<div class="property">
						<span>params</span>
						<!-- TODO display the generated type string instead of the schema,
						probably by generating a sibling file to `events.ts` like `eventTypeStrings.ts` -->
						<pre>
            {JSON.stringify(eventInfo.params, null, 2)}
          </pre>
					</div>
					{#if eventInfo.type !== 'ClientEvent'}
						<div class="property">
							<span>response</span>
							<pre>
								<!-- TODO display the generated type string instead of the schema,
								probably by generating a sibling file to `events.ts` like `eventTypeStrings.ts` -->
								<pre>
								{JSON.stringify(eventInfo.response, null, 2)}
          </pre>
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
		<hr />
		<div class="markup">
			<ul>
				<li>
					<a href="#docs">docs</a>
					<ul>
						<li><a href="#vocab">vocab</a></li>
						<li><a href="#events">events</a></li>
					</ul>
				</li>
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
