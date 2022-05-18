import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		persona: $persona,
		community: $community,
		spaces: $spaces,
		membership: $membership,
	} = result.value;
	addPersona(ui, $persona);
	addCommunity(ui, $community, $spaces, [$membership]);
	return result;
};
