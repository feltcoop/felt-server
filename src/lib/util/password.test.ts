import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {verifyPassword, toPasswordKey} from '$lib/util/password';

/* test__verifyPassword */
const test__verifyPassword = suite('verifyPassword');

test__verifyPassword('hash and verify a password', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	assert.ok(await verifyPassword(password, key));
});

test__verifyPassword('fail to verify', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	assert.not.ok(await verifyPassword('', key));
	assert.not.ok(await verifyPassword(password + '1', key));
	assert.not.ok(await verifyPassword(password, '1' + key));
	assert.not.ok(await verifyPassword(password, await toPasswordKey('')));
	assert.not.ok(await verifyPassword(password, await toPasswordKey(password + '1')));
});

test__verifyPassword.run();
/* test__verifyPassword */
