import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {red} from '@feltcoop/felt/util/terminal.js';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {services} from '$lib/server/services';
import {toRandomVocabContext} from '$lib/vocab/random';
import {randomEventParams} from '$lib/server/random';

/* test__services */
const test__services = suite<TestServerContext>('services');

test__services.before(setupServer);
test__services.after(teardownServer);

test__services('perform services', async ({server}) => {
	const random = toRandomVocabContext(server.db);

	for (const service of services.values()) {
		const account = await random.account();
		const params = await randomEventParams(service.event, random, {account});
		if (!validateSchema(service.event.params.schema!)(params)) {
			throw new Error(
				`Failed to validate random params for service ${
					service.event.name
				}: ${toValidationErrorMessage(validateSchema(service.event.params.schema!).errors![0])}`,
			);
		}
		const result = await service.perform({server, params, account_id: account.account_id});
		if (!result.ok || !validateSchema(service.event.response.schema!)(result.value)) {
			console.error(red(`failed to validate service response: ${service.event.name}`), result);
			throw new Error(
				`Failed to validate response for service ${service.event.name}: ${toValidationErrorMessage(
					validateSchema(service.event.response.schema!).errors![0],
				)}`,
			);
		}
		assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
	}
});

test__services.run();
/* test__services */
