<script lang="ts">
	import {type Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {scale} from 'svelte/transition';

	import {type Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';

	export let entity: Readable<Entity>;
	export let propertyName: string;

	const {dispatch} = getApp();

	$: value = ($entity as any)[propertyName];

	const serialize = (propertyName: string, $entity: Entity) =>
		propertyName === 'data' ? JSON.stringify($entity.data) : undefined;

	$: serialized = serialize(propertyName, $entity); // TODO
	let updated = serialize(propertyName, $entity);
	$: changed = updated !== serialized;

	let errorMessage: string | null = null;

	const save = async () => {
		errorMessage = null;
		if (!changed) return;
		let updatedData: typeof $entity['data'];
		try {
			updatedData = JSON.parse(updated!);
		} catch (err) {
			errorMessage = 'invalid json';
			return;
		}
		const result = await dispatch('UpdateEntity', {
			entity_id: $entity.entity_id,
			data: updatedData,
		});
		if (!result.ok) errorMessage = result.message;
	};

	const reset = () => {
		updated = serialize(propertyName, $entity);
	};
</script>

{#if propertyName.endsWith('_id')}
	<!-- TODO  propertyName === 'actor_id' etc -->
	{value}
{:else if propertyName === 'data'}<textarea bind:value={updated} />{:else}
	{value}
{/if}
{#if changed}
	<div class="buttons" in:scale>
		<button on:click={reset}>reset</button>
		<button on:click={save}>save</button>
	</div>
{/if}
{#if errorMessage}
	<Message status="error">{errorMessage}</Message>
{/if}
