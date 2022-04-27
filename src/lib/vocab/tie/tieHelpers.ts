import type {Tie} from '$lib/vocab/tie/tie';

export const toTieEntityIds = (ties: Tie[]): Set<number> => {
	const ids = new Set<number>();
	for (const {source_id, dest_id} of ties) {
		ids.add(source_id);
		ids.add(dest_id);
	}
	return ids;
};
