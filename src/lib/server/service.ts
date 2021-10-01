import type {ApiServer} from '$lib/server/ApiServer.js';
import type {ServiceEventInfo} from '$lib/vocab/event/event';

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
	event: ServiceEventInfo;
	perform(request: ServiceRequest<TParams>): Promise<TResponse>;
}

export interface ServiceRequest<TParams extends object> {
	server: ApiServer;
	params: TParams;
	account_id: number;
}
