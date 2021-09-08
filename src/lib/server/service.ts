import type {ValidateFunction} from 'ajv';
import type {TSchema, Static} from '@sinclair/typebox';

import type {ApiServer} from '$lib/server/ApiServer.js';
import type {ErrorResponse} from '$lib/util/error';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export interface Service<
	TParamsSchema extends ServiceParamsSchema,
	TResponseData extends ServiceResponseData,
> {
	paramsSchema: TParamsSchema; // TODO <TParams>;
	// paramsSchema: TypeBuilder['Object']<TParams>;
	validateParams?: ValidateFunction<Static<TParamsSchema>>;
	// TODO input/output schemas
	handle(
		// TODO maybe make this take a single object argument?
		server: ApiServer,
		// TODO to support websockets we probably need to forward only the params/query/etc (headers?),
		// maybe combined into a single object for reusability in routeless websocket events
		params: Static<TParamsSchema>,
		account_id: number,
	): Promise<ServiceResponse<TResponseData>>;
}

export type ServiceParamsSchema = TSchema;

export interface ServiceResponse<TResponseData extends ServiceResponseData> {
	code: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: string | Buffer | ArrayBuffer | Buffer[];
	// http types: string | object | Stream | Buffer | undefined
	data: TResponseData | ErrorResponse;
}

export type ServiceResponseData = string | object;
