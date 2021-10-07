import {suite} from 'uvu';
import * as t from 'uvu/assert';
import type {AnySchema} from 'ajv';

import {schemas} from '$lib/app/schemas';
import {ID_VOCAB_PREFIX} from '$lib/vocab/util';

const printSchema = (schema: AnySchema) =>
	typeof schema === 'boolean'
		? `AnonymousBooleanSchema`
		: '$id' in schema
		? schema.$id
		: 'AnonymousSchema';

/* test__schemas */
const test__schemas = suite('schemas');

for (const schema of schemas) {
	test__schemas('validate entity schema: ' + printSchema(schema), async () => {
		t.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
		t.ok(schema.$id);
		t.ok(schema.$id.startsWith(ID_VOCAB_PREFIX));
	});
}

test__schemas.run();
/* test__schemas */
