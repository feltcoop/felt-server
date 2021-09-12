import {suite} from 'uvu';
import * as t from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testHelpers';
import {setupServer, teardownServer} from '$lib/util/testHelpers';
import {validateFile} from '$lib/vocab/file/file';
import {toValidationErrorMessage} from '$lib/util/ajv';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__fileRepo */
const test__fileRepo = suite<TestServerContext>('fileRepo');

test__fileRepo.before(setupServer);
test__fileRepo.after(teardownServer);

test__fileRepo('create a file', async ({server}) => {
	// TODO refactor these vars -- seed?
	const actor_id = 1;
	const space_id = 1;

	const result = await server.db.repos.file.create(actor_id, space_id, 'hello');
	t.ok(result.ok);
	const valid = validateFile()(result.value);
	if (!valid) {
		throw new Error(
			`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
		);
	}
});

test__fileRepo.run();
/* test__fileRepo */
