import type {Tie} from './tie';

export const toTieEntityIds = (
	ties: Tie[],
	filter?: (entity_id: number) => boolean,
): Set<number> => {
	const ids = new Set<number>();
	for (const {source_id, dest_id} of ties) {
		if (!filter || filter(source_id)) ids.add(source_id);
		if (!filter || filter(dest_id)) ids.add(dest_id);
	}
	return ids;
};
