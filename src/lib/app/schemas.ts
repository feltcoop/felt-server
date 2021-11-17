import type {SchemaObject} from 'ajv';

import {eventInfos} from '$lib/app/events';
import {entities} from '$lib/app/entities';

export const schemas: SchemaObject[] = entities.concat(
	eventInfos
		.flatMap((eventInfo) => [
			eventInfo.params,
			'response' in eventInfo ? eventInfo.response : (null as any),
		])
		.filter(Boolean),
);
