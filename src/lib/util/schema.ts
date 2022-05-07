import {stripEnd, stripStart} from '@feltcoop/felt/util/string.js';

// see also $lib/util/ajv.ts

export const toSchemaName = ($id: string): string =>
	stripEnd(stripStart($id, '/schemas/'), '.json');
