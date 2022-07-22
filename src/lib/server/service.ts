import type {Result} from '@feltcoop/felt';

import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {Database} from '$lib/db/Database';

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
	perform: (serviceRequest: ServiceRequest<TParams>) => Promise<TResult>;
}

export interface ServiceRequest<TParams> {
	repos: Repos;
	transact: () => Promise<Repos>;
	params: TParams;
	account_id: number;
	session: ISessionApi;
	promise: Promise<void> | null;
}

export const toServiceRequest = <TParams = any>(
	db: Database,
	params: TParams,
	account_id: number,
	session: ISessionApi,
): ServiceRequest<TParams> => ({
	repos: db.repos,
	// TODO BLOCK the transaction ends immediately here, how to do return value correctly?
	transact: () => db.sql.begin((sql) => new Repos(sql)),
	params,
	account_id, // TODO how to handle this type for services that don't require an account_id?
	session,
	promise: null,
});
