import {get, writable} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';

export const CreateMembership: Mutations['CreateMembership'] = async ({
	invoke,
	ui: {memberships},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {membership: $membership} = result.value;
	// TODO also update `communities.personas`
	memberships.mutate(($memberships) => $memberships.push(writable($membership)));
	return result;
};

export const DeleteMembership: Mutations['DeleteMembership'] = async ({
	params,
	invoke,
	ui: {memberships},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	// TODO also update `communities.personas`
	memberships.mutate(($memberships) =>
		$memberships.splice(
			$memberships.findIndex(
				(membership) =>
					get(membership).persona_id !== params.persona_id ||
					get(membership).community_id !== params.community_id,
			),
			1,
		),
	);

	return result;
};
