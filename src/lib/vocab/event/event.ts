import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

export interface EventData {
	name: string;
	params: {
		type: string;
		schema: AnySchema | null;
	};
	response: {
		type: string;
		schema: AnySchema | null;
	};
	returns: string;
	route?: {
		path: string;
		method: ServiceMethod;
	};
}
