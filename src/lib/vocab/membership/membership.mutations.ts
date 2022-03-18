import type {Mutations} from '$lib/app/mutationTypes';

export const CreateMembership: Mutations['CreateMembership'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {membership: $membership} = result.value;
	log.trace('[CreateMembership]', $membership);
	// TODO also update `communities.personas`
	memberships.mutate(($memberships) => $memberships.push(writable($membership)));
	return result;
};

export const DeleteMembership: Mutations['DeleteMembership'] = async ({params, invoke}) => {
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
