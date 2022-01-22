import type {Result} from '@feltcoop/felt';

import type {Database} from '$lib/db/Database';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {ApiServer, Request} from '$lib/server/ApiServer';

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
export interface Service<TParams, TResult extends Result> {
	event: ServiceEventInfo;
	perform(request: ServiceRequest<TParams>): Promise<TResult & {effects?: ServiceEffect[]}>;
}

export interface ServiceRequest<TParams> {
	repos: Database['repos'];
	params: TParams;
	account_id: number;
}

export interface ServiceEffect {
	(options: {server?: ApiServer; req?: Request}): void | Promise<void>;
}
