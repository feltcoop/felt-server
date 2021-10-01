import type {ValidateFunction, AnySchema} from 'ajv';

import type {ApiServer} from '$lib/server/ApiServer.js';

export type ServiceMethod =
	| 'GET'
	| 'HEAD'
	| 'PATCH'
	| 'OPTIONS'
	| 'CONNECT'
	| 'DELETE'
	| 'TRACE'
	| 'POST'
	| 'PUT';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export interface Service<TParams extends object, TResponse extends object> {
	name: string; // `snake_cased`
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		// supports each `trouter` http method: https://github.com/lukeed/trouter#method
		method: ServiceMethod;
	};
	paramsSchema: AnySchema;
	validateParams: () => ValidateFunction<TParams>; // lazy to avoid wasteful compilation
	responseSchema: AnySchema;
	validateResponse: () => ValidateFunction<TResponse>; // lazy to avoid wasteful compilation
	perform(request: ServiceRequest<TParams>): Promise<TResponse>;
}

export interface ServiceRequest<TParams extends object> {
	server: ApiServer;
	params: TParams;
	account_id: number;
}
