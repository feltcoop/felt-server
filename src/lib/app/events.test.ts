import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {noop} from '@feltcoop/felt/util/function.js';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {eventInfos} from '$lib/app/events';
import {toRandomVocabContext} from '$lib/vocab/random';
import {randomEventParams} from '$lib/server/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {setupApp, teardownApp} from '$lib/util/testAppHelpers';

/* eslint-disable no-await-in-loop */

/* test__eventInfos */
const test__eventInfos = suite<TestDbContext & TestAppContext>('eventInfos');

test__eventInfos.before(setupDb);
test__eventInfos.after(teardownDb);
test__eventInfos.before(setupApp(noop as any)); // TODO either use `node-fetch` or mock
test__eventInfos.after(teardownApp);

test__eventInfos('dispatch random events in a client app', async ({db, app}) => {
	const random = toRandomVocabContext(db);

	for (const eventInfo of eventInfos.values()) {
		const account = await random.account();
		const params = await randomEventParams(eventInfo, random, {account});

		if (eventInfo.params) {
			if (!validateSchema(eventInfo.params)(params)) {
				throw new Error(
					`Failed to validate random params for service ${
						eventInfo.name
					}: ${toValidationErrorMessage(validateSchema(eventInfo.params).errors![0])}`,
				);
			}
		} else if (
			eventInfo.type === 'ServiceEvent' &&
			eventInfo.params !== null // allow void params
		) {
			throw Error(`Expected eventInfo to have a schema: ${eventInfo.name}`);
		}

		// TODO can't make remote calls yet -- either use `node-fetch` or mock
		if (eventInfo.type !== 'ClientEvent') {
			continue;
		}

		// TODO fix typecast with a union for `eventInfo`
		const result = await app.dispatch(eventInfo.name as any, params);
		if (eventInfo.type === 'ClientEvent') {
			// TODO don't have schemas for `returns` yet, but eventually we'll want them and then validate here
			if (eventInfo.returns !== 'void') {
				assert.ok(result !== undefined);
			}
		} else {
			// TODO can't make remote calls yet -- need to use either `node-fetch` or mock
			// if (!result.ok) {
			// 	log.error(`dispatch failed: ${eventInfo.name}`, result);
			// } else if (!validateSchema(eventInfo.response!)(result.value)) {
			// 	log.error(`failed to validate service response: ${eventInfo.name}`, result);
			// 	throw new Error(
			// 		`Failed to validate response for service ${eventInfo.name}: ${toValidationErrorMessage(
			// 			validateSchema(eventInfo.response!).errors![0],
			// 		)}`,
			// 	);
			// }
			// assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
		}
	}
});

test__eventInfos.run();
/* test__eventInfos */
