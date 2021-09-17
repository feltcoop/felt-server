import type {ValidateFunction} from 'ajv';
import type {TSchema, Static} from '@sinclair/typebox';

import type {ApiServer} from '$lib/server/ApiServer.js';
import type {ErrorResponse} from '$lib/util/error';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export interface Service<TParamsSchema extends TSchema, TResponseSchema extends TSchema> {
	name: string; // `snake_cased`
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		// supports each `trouter` http method: https://github.com/lukeed/trouter#method
		method: 'GET' | 'HEAD' | 'PATCH' | 'OPTIONS' | 'CONNECT' | 'DELETE' | 'TRACE' | 'POST' | 'PUT';
	};
	paramsSchema: TParamsSchema;
	validateParams: () => ValidateFunction<Static<TParamsSchema>>; // lazy to avoid wasteful compilation
	responseSchema: TResponseSchema;
	validateResponse: () => ValidateFunction<Static<TResponseSchema>>; // lazy to avoid wasteful compilation
	perform(
		request: ServiceRequest<TParamsSchema>,
	): Promise<ServiceResponse<Static<TResponseSchema>>>;
}

export interface ServiceRequest<TParamsSchema extends TSchema> {
	server: ApiServer;
	params: Static<TParamsSchema>;
	account_id: number;
}

export interface ServiceResponse<TResponseValue extends object> {
	status: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: `string | Buffer | ArrayBuffer | Buffer[]`
	// http types: `string | object | Stream | Buffer | undefined`
	value: TResponseValue | ErrorResponse;
}
