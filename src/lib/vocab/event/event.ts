import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

export interface EventInfo {
	name: string; // `snake_cased`
	params: {
		type: string;
		schema: AnySchema | null;
	};
	response: {
		type: string;
		schema: AnySchema | null;
	};
	returns: string;
	// for services
	// TODO probably make `EventInfo` a type union that includes types with/without route,
	// and then we can remove the `!` assertions on `route` and `schema`
	route?: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		method: ServiceMethod; // supports each `trouter` http method: https://github.com/lukeed/trouter#method
	};
}
