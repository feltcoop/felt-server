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
	transact: <T>(cb: (repos: Repos) => Promise<T>) => Promise<T>;
	params: TParams;
	account_id: number;
	session: ISessionApi;
}

export const toServiceRequest = <TParams = any>(
	db: Database,
	params: TParams,
	account_id: number,
	session: ISessionApi,
): ServiceRequest<TParams> => {
	let repos: Repos | undefined; // cache `transact`'s result to enable service composition
	return {
		repos: db.repos,
		// TODO BLOCK how to support creating new transactions? `cbOrCreateNew`?
		transact: async (cb) => {
			try {
				const result2 = await (repos
					? //  TODO does this composed callback also need a try/catch?
					  cb(repos)
					: (db.sql.begin(async (sql) => {
							const result = await cb((repos = new Repos(sql)));
							if (!result.ok) {
								throw Error('Failed transction');
							}
							return result;
					  }) as any));
			} catch (err) {
				//
			} finally {
				//
			}
		}, // typecast is due to postgres' more flexible API
		params,
		account_id, // TODO how to handle this type for services that don't require an account_id?
		session,
	};
};
