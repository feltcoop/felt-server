// This is not RESTful as in HATEOS,
// instead it's a sometimes-convenient alternative to the primary websocket API.
// Due to its secondary importance it's expected to have limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';

import type {ApiClient, ApiResult} from '$lib/ui/ApiClient';
import * as servicesMeta from '$lib/server/servicesMeta';
import type {ServiceMeta} from '$lib/server/servicesMeta';

// TODO make `fetch` a parameter once the client isn't created for SSR
// fetch: typeof window.fetch,
export const toHttpApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(): ApiClient<TParamsMap, TResultMap> => {
	const client: ApiClient<TParamsMap, TResultMap> = {
		invoke: async (name, params) => {
			console.log('[http api client] invoke', name, params);
			const serviceMeta: ServiceMeta = (servicesMeta as any)[name];
			if (!serviceMeta) {
				return {ok: false, status: 400, reason: `Failed to invoke unknown service: ${name}`};
			}
			const path = inject(serviceMeta.route.path, params);
			const {method} = serviceMeta.route;
			try {
				const res = await fetch(path, {
					method,
					headers: {'content-type': 'application/json'},
					body: method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params),
				});
				// TODO need to think through how to properly handle errors here
				// if (!res.ok) {
				// 	try {
				// 		const result = await res.json();
				// 		return {
				// 			ok: false,
				// 			status: res.status,
				// 			reason: result.reason || res.statusText || 'Unknown error',
				// 		};
				// 	} catch {
				// 		return {ok: false, status: res.status, reason: res.statusText || 'Unknown error'};
				// 	}
				// }
				const result = await res.json();
				console.log('[http api client] result', result);
				return {ok: true, status: res.status, value: result};
			} catch (err) {
				return {ok: false, status: 500, reason: err.message || 'Unknown error'}; // TODO ? Network issues?
			}
		},
		close: () => {
			// TODO ?
		},
	};
	return client;
};
