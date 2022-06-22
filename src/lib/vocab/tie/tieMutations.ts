import type {Mutations} from '$lib/app/eventTypes';
import {evictTie, updateTieCaches} from '$lib/vocab/entity/entityMutationHelpers';

export const CreateTie: Mutations['CreateTie'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	updateTieCaches(ui, result.value.tie);
	return result;
};

export const ReadTies: Mutations['ReadTies'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	for (const $tie of result.value.ties) {
		updateTieCaches(ui, $tie);
	}

	return result;
};

export const DeleteTie: Mutations['DeleteTie'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	evictTie(ui, params.source_id, params.dest_id, params.type);
	return result;
};
