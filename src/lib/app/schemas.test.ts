import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import type {SchemaObject} from 'ajv';

import {schemas} from '$lib/app/schemas';

const printSchema = (schema: SchemaObject) => ('$id' in schema ? schema.$id : 'AnonymousSchema');

/* test__schemas */
const test__schemas = suite('schemas');

for (const schema of schemas) {
	test__schemas('validate entity schema: ' + printSchema(schema), async () => {
		assert.ok(typeof schema !== 'boolean'); // compared to using `t.type`, this makes TypeScript understand
		assert.ok(schema.$id);
		assert.ok(schema.$id.startsWith('/schemas/'));
	});
}

test__schemas.run();
/* test__schemas */
