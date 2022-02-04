import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {red} from 'kleur/colors';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {services} from '$lib/server/services';
import {toRandomVocabContext} from '$lib/vocab/random';
import {randomEventParams} from '$lib/server/random';
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* test__services */
const test__services = suite<TestDbContext>('services');

test__services.before(setupDb);
test__services.after(teardownDb);

test__services('perform services', async ({db}) => {
	const random = toRandomVocabContext(db);

	for (const service of services.values()) {
		const account = await random.account();
		const params = await randomEventParams(service.event, random, {account});
		if (!validateSchema(service.event.params!)(params)) {
			throw new Error(
				`Failed to validate random params for service ${
					service.event.name
				}: ${toValidationErrorMessage(validateSchema(service.event.params!).errors![0])}`,
			);
		}
		const result = await service.perform({
			repos: db.repos,
			params,
			account_id: service.event.authenticate === false ? (null as any) : account.account_id,
			session: new SessionApiMock(),
		});
		if (!result.ok || !validateSchema(service.event.response!)(result.value)) {
			console.error(red(`failed to validate service response: ${service.event.name}`), result);
			throw new Error(
				`Failed to validate response for service ${service.event.name}: ${toValidationErrorMessage(
					validateSchema(service.event.response!).errors![0],
				)}`,
			);
		}
		assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
	}
});

test__services.run();
/* test__services */
