import type {SchemaObject} from 'ajv';

import {eventInfos} from '$lib/app/events';
import {entities} from '$lib/app/entities';

export const schemas: SchemaObject[] = entities.concat(
	eventInfos
		.flatMap((eventInfo) => [
			eventInfo.params.schema,
			'response' in eventInfo ? eventInfo.response.schema : (null as any),
		])
		.filter(Boolean),
);
