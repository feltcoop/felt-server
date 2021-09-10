import {suite} from 'uvu';
import * as t from 'uvu/assert';

import {verify_password, to_password_key} from '$lib/util/password';

/* test__verify_password */
const test__verify_password = suite('verify_password');

test__verify_password('hash and verify a password', async () => {
	const password = 'password';
	const key = await to_password_key(password);
	t.ok(await verify_password(password, key));
});

test__verify_password('fail to verify', async () => {
	const password = 'password';
	const key = await to_password_key(password);
	t.not.ok(await verify_password('', key));
	t.not.ok(await verify_password(password + '1', key));
	t.not.ok(await verify_password(password, '1' + key));
	t.not.ok(await verify_password(password, await to_password_key('')));
	t.not.ok(await verify_password(password, await to_password_key(password + '1')));
});

test__verify_password.run();
/* test__verify_password */
