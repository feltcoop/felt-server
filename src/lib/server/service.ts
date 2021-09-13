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
		method: 'get' | 'head' | 'patch' | 'options' | 'connect' | 'delete' | 'trace' | 'post' | 'put';
	};
	paramsSchema: TParamsSchema;
	validateParams: () => ValidateFunction<Static<TParamsSchema>>; // lazy to avoid wasteful compilation
	responseSchema: TResponseSchema;
	validateResponse: () => ValidateFunction<Static<TResponseSchema>>; // lazy to avoid wasteful compilation
	perform(
		// TODO maybe make this take a single object argument?
		server: ApiServer,
		params: Static<TParamsSchema>,
		account_id: number,
	): Promise<ServiceResponse<Static<TResponseSchema>>>;
}

export interface ServiceResponse<TResponseData extends ServiceResponseData> {
	code: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: `string | Buffer | ArrayBuffer | Buffer[]`
	// http types: `string | object | Stream | Buffer | undefined`
	data: TResponseData | ErrorResponse;
}

export type ServiceResponseData = object;
