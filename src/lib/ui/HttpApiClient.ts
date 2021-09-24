// This is not RESTful as in HATEOS,
// instead it's a sometimes-convenient alternative to the primary websocket API.
// Due to its secondary importance it's expected to have limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';

import type {ApiClient} from '$lib/ui/ApiClient';
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
				let json;
				try {
					json = await res.json();
				} catch (err) {
					console.error('[http api client] parse error', err, res);
					return {
						ok: false,
						status: null, // discard `res.status` because something else went wrong
						reason: 'Server response is not valid JSON',
					};
				}
				console.log('[http api client] result', res.ok, res.status, json);
				if (res.ok) {
					return {ok: true, status: res.status, value: json};
				} else {
					return {
						ok: false,
						status: res.status,
						reason: json.reason || res.statusText || 'Unknown error',
					};
				}
			} catch (err) {
				console.error('[http api client] fetch error', err);
				return {
					ok: false,
					status: null,
					reason: 'Network error: please check your Internet connection and try again',
				};
			}
		},
		close: () => {
			// TODO ?
		},
	};
	return client;
};
