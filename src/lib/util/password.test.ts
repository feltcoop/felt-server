import {suite} from 'uvu';
import * as t from 'uvu/assert';

import {verifyPassword, toPasswordKey} from '$lib/util/password';

/* test__verifyPassword */
const test__verifyPassword = suite('verifyPassword');

test__verifyPassword('hash and verify a password', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	t.ok(await verifyPassword(password, key));
});

test__verifyPassword('fail to verify', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	t.not.ok(await verifyPassword('', key));
	t.not.ok(await verifyPassword(password + '1', key));
	t.not.ok(await verifyPassword(password, '1' + key));
	t.not.ok(await verifyPassword(password, await toPasswordKey('')));
	t.not.ok(await verifyPassword(password, await toPasswordKey(password + '1')));
});

test__verifyPassword.run();
/* test__verifyPassword */
