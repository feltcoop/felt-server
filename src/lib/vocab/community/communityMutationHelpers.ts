import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Membership} from '$lib/vocab//membership/membership';

export const addCommunity = (
	{
		memberships,
		spaceById,
		spaces,
		spaceIdSelectionByCommunityId,
		communityById,
		communities,
	}: WritableUi,
	$community: Community,
	$communitySpaces: Space[],
	$memberships: Membership[],
): Writable<Community> => {
	memberships.mutate(($ms) => $ms.push(...$memberships.map(($m) => writable($m))));

	// TODO what's the right order of updating `communities` and `spaces`?
	// We may get circular derived dependencies that put things in a bad state if either one is
	// updated first, in which case we may need something like deferred store transaction updates.

	let $spacesToAdd: Space[] | null = null;
	for (const $space of $communitySpaces) {
		if (!spaceById.has($space.space_id)) {
			($spacesToAdd || ($spacesToAdd = [])).push($space);
		}
	}
	if ($spacesToAdd) {
		const spacesToAdd = $spacesToAdd.map((s) => writable(s));
		spacesToAdd.forEach((s, i) => spaceById.set($spacesToAdd![i].space_id, s));
		spaces.mutate(($spaces) => $spaces.push(...spacesToAdd));
	}
	spaceIdSelectionByCommunityId.mutate(($s) => {
		$s.set($community.community_id, $communitySpaces[0].space_id);
	});
	const community = writable($community);
	// TODO this updates the map before the store array because it may be derived,
	// but is the better implementation to use a `mutable` wrapping a map, no array?
	communityById.set($community.community_id, community);
	communities.mutate(($communities) => $communities.push(community));
	return community;
};
