import type {Mutations} from '$lib/app/eventTypes';
import {updateTieCaches} from '$lib/vocab/entity/entityMutationHelpers';

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

export const DeleteTie: Mutations['DeleteTie'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO figure out front end state for Ties
	return result;
};
