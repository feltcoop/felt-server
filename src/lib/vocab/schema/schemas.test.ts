import {suite} from 'uvu';
import * as t from 'uvu/assert';

import {schemas} from '$lib/vocab/schema/schemas';
import {ID_VOCAB_PREFIX} from '$lib/vocab/schema/schema';

const test__schemas = suite('schemas');

test__schemas('ensure schemas are valid', async () => {
	for (const schema of schemas) {
		t.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
		t.ok(schema.$id);
		t.ok(schema.$id.startsWith(ID_VOCAB_PREFIX));
	}
});

test__schemas.run();
/* test__schemas */
