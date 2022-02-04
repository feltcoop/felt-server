import type {SchemaObject} from 'ajv';
import {DialogDataSchema} from '@feltcoop/felt/ui/dialog/dialog.schema.js';

import {eventInfos} from '$lib/app/events';
import {entities} from '$lib/app/entities';

export const schemas: SchemaObject[] = entities;

entities.push(
	...eventInfos
		.flatMap((eventInfo) => [
			eventInfo.params,
			'response' in eventInfo ? eventInfo.response : (null as any),
		])
		.filter(Boolean),
);

// Include external schema dependencies.
entities.push(DialogDataSchema);
