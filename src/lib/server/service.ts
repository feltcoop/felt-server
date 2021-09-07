import type {ApiServer} from '$lib/server/ApiServer.js';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Json} from '@feltcoop/felt/util/json.js';

// A `Service` can be reused across both http and websocket handlers.
export interface Service<TParams extends ServiceParams = ServiceParams> {
	// TODO input/output schemas
	handle(
		// TODO maybe make this take a single object argument?
		server: ApiServer,
		// TODO to support websockets we probably need to forward only the params/query/etc (headers?),
		// maybe combined into a single object for reusability in routeless websocket events
		params: TParams,
		account: AccountModel,
	): Promise<ServiceResponse>;
}

export interface ServiceParams {
	[key: string]: Json;
}

export interface ServiceResponse {
	code: number;
	// TODO handle the types compatible with both websockets and http:
	// websocket types: string | Buffer | ArrayBuffer | Buffer[];
	// http types: string | object | Stream | Buffer | undefined
	data: string | object; // TODO consistent error type?
}
