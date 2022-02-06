<script lang="ts">
	import type {SchemaObject} from 'ajv';

	export let schema: SchemaObject;

	let properties: undefined | Array<[string, SchemaObject]>;
	$: properties =
		typeof schema !== 'boolean' &&
		schema.properties &&
		Array.from(Object.entries(schema.properties));
</script>

<div>
	{#if typeof schema === 'boolean'}
		<div class="title">
			<code class="name">{schema}</code>
		</div>
	{:else}
		<div class="title">
			{#if schema.$id}
				<code class="name">{schema.$id}</code>
			{/if}
			<small class="type">{schema.type || 'unknown'}</small>
		</div>
		{#if properties}
			{#each properties as [propertyName, propertySchema]}
				<div class="property">
					<span class="name">{propertyName}</span>
					<small class="required">
						<!-- TODO cache this on a viewmodel? -->
						{#if schema.required?.includes(propertyName)}
							<!-- leave blank? -->
						{:else}
							<span title="{propertyName} is optional">?</span>
						{/if}
					</small>
					<svelte:self schema={propertySchema} />
				</div>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.title .name {
		font-size: var(--font_size_lg);
		padding: var(--spacing_md);
		font-family: var(--font_family_mono);
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
	.property .name {
		display: flex;
		width: 180px;
	}
	.required {
		display: flex;
		width: 30px;
	}
</style>
