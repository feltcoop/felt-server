import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {deserialize, deserializeDate, deserializers} from '$lib/util/deserialize';

/* test__deserialize */
const test__deserialize = suite('deserialize');

test__deserialize('deserialize Date values for created and updated', async () => {
	const someUnregisteredDate = new Date();
	const created = new Date();
	const updated = new Date();
	const value = JSON.parse(JSON.stringify({someUnregisteredDate, created, updated}));
	deserialize(deserializers)(value);
	assert.equal(value, {
		someUnregisteredDate: someUnregisteredDate.toISOString(),
		created,
		updated,
	});
});

test__deserialize('deserialize custom Date values', async () => {
	const someUnregisteredDate = new Date();
	const someCustomDate = new Date();
	const value = JSON.parse(JSON.stringify({someUnregisteredDate, someCustomDate}));
	deserialize(new Map([['someCustomDate', deserializeDate]]))(value);
	assert.equal(value, {
		someUnregisteredDate: someUnregisteredDate.toISOString(),
		someCustomDate,
	});
});

test__deserialize.run();
/* test__deserialize */
