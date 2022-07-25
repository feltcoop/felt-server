import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {red} from 'kleur/colors';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {log, toServiceRequestMock} from '$lib/util/testHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {services} from '$lib/server/services';
import {randomEventParams} from '$lib/util/randomEventParams';
import {SessionApiMock} from '$lib/session/SessionApiMock';

/* test__services */
const test__services = suite<TestDbContext>('services');

test__services.before(setupDb);
test__services.after(teardownDb);

const session = new SessionApiMock(); // reuse the session so it tests login sequentially

for (const service of services.values()) {
	test__services(`perform service ${service.event.name}`, async ({db, random}) => {
		const account = await random.account();
		const params = await randomEventParams[service.event.name](random, {account});
		if (!validateSchema(service.event.params)(params)) {
			throw new Error(
				`Failed to validate random params for service ${
					service.event.name
				}: ${toValidationErrorMessage(validateSchema(service.event.params).errors![0])}`,
			);
		}
		const result = await service.perform({
			params,
			...toServiceRequestMock(
				// TODO what's the proper type here? should `account_id` be optional?
				service.event.authenticate === false ? (null as any) : account.account_id,
				db,
				session,
			),
		});
		if (!result.ok) {
			log.error(red(`failed service call: ${service.event.name}`), params, result);
			throw new Error(`Failed service call: ${service.event.name}`);
		} else if (!validateSchema(service.event.response)(result.value)) {
			log.error(red(`failed to validate service response: ${service.event.name}`), params, result);
			throw new Error(
				`Failed to validate response for service ${service.event.name}: ${toValidationErrorMessage(
					validateSchema(service.event.response).errors![0],
				)}`,
			);
		}
		assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
	});
}

test__services(`check for duplicate HTTP route paths`, async () => {
	const paths = new Set();

	for (const service of services.values()) {
		const key = service.event.route.method + ':' + service.event.route.path;
		if (paths.has(key)) {
			throw Error(`Duplicate service event route ${key}`);
		}
		paths.add(key);
	}
});

test__services.run();
/* test__services */
