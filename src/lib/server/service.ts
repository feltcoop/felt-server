import type {ApiServer} from '$lib/server/ApiServer.js';
import type {ErrorResponse} from '$lib/util/error';
import type {Json} from '@feltcoop/felt/util/json.js';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export interface Service<TParams extends ServiceParams, TResponseData extends ServiceResponseData> {
	// TODO input/output schemas
	handle(
		// TODO maybe make this take a single object argument?
		server: ApiServer,
		// TODO to support websockets we probably need to forward only the params/query/etc (headers?),
		// maybe combined into a single object for reusability in routeless websocket events
		params: TParams,
		account_id: number,
	): Promise<ServiceResponse<TResponseData>>;
}

export interface ServiceParams {
	[key: string]: Json;
}

export interface ServiceResponse<TResponseData extends ServiceResponseData> {
	code: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: string | Buffer | ArrayBuffer | Buffer[];
	// http types: string | object | Stream | Buffer | undefined
	data: TResponseData | ErrorResponse;
}

export type ServiceResponseData = string | object;
