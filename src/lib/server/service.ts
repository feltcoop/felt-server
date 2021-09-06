import type {Stream} from 'stream';

import type {ApiServer, Request} from '$lib/server/ApiServer.js';

// A `Service` can be reused across both http and websocket handlers.
export interface Service {
	// TODO input/output schemas
	handle(
		server: ApiServer,
		// TODO to support websockets we probably need to forward only the params/query/etc (headers?),
		// maybe combined into a single object for reusability in routeless websocket events
		req: Request,
	): Promise<ServiceResponse>;
}

export interface ServiceResponse {
	code: number;
	data: string | object | Stream | Buffer | undefined; // TODO structured error type? Currently we use `{reason: string}`
	// headers?: OutgoingHttpHeaders; // TODO hmm will we need this? what about websockets?
}
