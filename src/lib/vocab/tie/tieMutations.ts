import type {Mutations} from '$lib/app/eventTypes';

export const CreateTie: Mutations['CreateTie'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO figure out front end state for Ties
	return result;
};

export const ReadTies: Mutations['ReadTies'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO figure out front end state for Ties
	return result;
};

export const DeleteTie: Mutations['DeleteTie'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO figure out front end state for Ties
	return result;
};
