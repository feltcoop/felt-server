import type {ValidateFunction} from 'ajv';
import type {TSchema, Static} from '@sinclair/typebox';

import type {ApiServer} from '$lib/server/ApiServer.js';
import type {ErrorResponse} from '$lib/util/error';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export interface Service<
	TParamsSchema extends ServiceParamsSchema,
	TResponseData extends ServiceResponseData, // TODO change to an output response schema
> {
	name: string; // `snake_cased`
	paramsSchema: TParamsSchema;
	validateParams?: ValidateFunction<Static<TParamsSchema>>; // created lazily
	// TODO is `handle` the best name?
	handle(
		// TODO maybe make this take a single object argument?
		server: ApiServer,
		params: Static<TParamsSchema>,
		account_id: number,
	): Promise<ServiceResponse<TResponseData>>;
}

export type ServiceParamsSchema = TSchema;

export interface ServiceResponse<TResponseData extends ServiceResponseData> {
	code: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: `string | Buffer | ArrayBuffer | Buffer[]`
	// http types: `string | object | Stream | Buffer | undefined`
	data: TResponseData | ErrorResponse;
}

export type ServiceResponseData = string | object;
