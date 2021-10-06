import {suite} from 'uvu';
import * as t from 'uvu/assert';

import {entities} from '$lib/vocab/entity/entities';
import {ID_VOCAB_PREFIX} from '$lib/vocab/util';

const test__entities = suite('entities');

test__entities('ensure entity schemas are valid', async () => {
	for (const schema of entities) {
		t.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
		t.ok(schema.$id);
		t.ok(schema.$id.startsWith(ID_VOCAB_PREFIX));
	}
});

test__entities.run();
/* test__entities */
