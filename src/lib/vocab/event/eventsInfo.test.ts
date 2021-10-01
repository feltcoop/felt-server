import {suite} from 'uvu';
import * as t from 'uvu/assert';
import {red} from '@feltcoop/felt/util/terminal.js';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {eventsInfo} from '$lib/vocab/event/eventsInfo';
import {toRandomVocabContext} from '$lib/vocab/random';
import {randomEventParams} from '$lib/server/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {setupApp, teardownApp} from '$lib/util/testAppHelpers';

/* test__eventsInfo */
const test__eventsInfo = suite<TestServerContext & TestAppContext>('eventsInfo');

test__eventsInfo.before(setupServer);
test__eventsInfo.after(teardownServer);
test__eventsInfo.before(setupApp);
test__eventsInfo.after(teardownApp);

test__eventsInfo('create and use eventsInfo', async ({server, app}) => {
	// TODO in this context,
	const random = toRandomVocabContext(server.db);

	for (const eventInfo of eventsInfo.values()) {
		const account = await random.account();
		const params = await randomEventParams(eventInfo, random, {account});

		if (eventInfo.params.schema) {
			if (!validateSchema(eventInfo.params.schema)(params)) {
				throw new Error(
					`Failed to validate random params for service ${
						eventInfo.name
					}: ${toValidationErrorMessage(validateSchema(eventInfo.params.schema!).errors![0])}`,
				);
			}
		} else if (eventInfo.type === 'ServiceEvent' || eventInfo.type === 'RemoteEvent') {
			throw Error(`Expected eventInfo to have a schema: ${eventInfo.name}`);
		}

		// TODO fix typecase with a union for `eventInfo`
		const result = await app.api.dispatch(eventInfo.name as any, {
			server,
			params,
			account_id: account.account_id,
		});
		if (eventInfo.type === 'ClientEvent') {
			// TODO ?
		} else {
			if (!result.ok || !validateSchema(eventInfo.response.schema!)(result.value)) {
				console.error(red(`failed to validate service response: ${eventInfo.name}`), result);
				throw new Error(
					`Failed to validate response for service ${eventInfo.name}: ${toValidationErrorMessage(
						validateSchema(eventInfo.response.schema!).errors![0],
					)}`,
				);
			}
			t.is(result.status, 200); // TODO generate invalid data and test those params+responses too
		}
	}
});

test__eventsInfo.run();
/* test__eventsInfo */
