import {stripEnd, stripStart} from '@feltcoop/felt/util/string.js';

export const ID_PREFIX = 'https://felt.social';
export const ID_VOCAB_PREFIX = ID_PREFIX + '/vocab/';
export const ID_SUFFIX = '.json';

const names: Record<string, string | undefined> = {};

// TODO should schemas have a `name`? (check the spec - maybe we generate one, maybe we manually do it, or just at runtime)
export const toSchemaName = ($id: string): string =>
	names[$id] || (names[$id] = stripEnd(stripStart($id, ID_VOCAB_PREFIX), ID_SUFFIX));
