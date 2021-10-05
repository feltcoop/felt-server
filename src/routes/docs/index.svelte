<script lang="ts">
	import {eventsInfo} from '$lib/vocab/event/eventsInfo';

	const title = 'docs';
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="column">
	<ul>
		{#each eventsInfo as eventInfo (eventInfo.name)}
			<li>
				<code class="name">{eventInfo.name}</code>
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

<style>
	.column {
		overflow: auto;
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_lg) 0;
	}
	.name {
		font-size: var(--font_size_lg);
		padding: var(--spacing_md);
	}
	.property {
		display: flex;
		align-items: center;
		padding: var(--spacing_md) var(--spacing_md) var(--spacing_md) var(--spacing_xl4);
		background-color: var(--tint_dark_1);
	}
	.property:nth-child(2n) {
		background-color: var(--tint_dark_0);
	}
	.property > span {
		display: flex;
		width: 100px;
	}
</style>
