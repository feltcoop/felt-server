// This is not RESTful as in HATEOS,
// instead it's a sometimes-convenient alternative to the primary websocket API.
// Due to its secondary importance it's expected to have limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {ServiceEventInfo} from '$lib/vocab/event/event';

// TODO make `fetch` a parameter once the client isn't created for SSR
// fetch: typeof window.fetch,
export const toHttpApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(
	findService: (name: string) => ServiceEventInfo | undefined,
	fetch: typeof globalThis.fetch = globalThis.fetch,
): ApiClient<TParamsMap, TResultMap> => {
	const client: ApiClient<TParamsMap, TResultMap> = {
		has: (name) => !!findService(name), // TODO maybe change the API to return the service, and optionally accept it to `invoke`
		invoke: async (name, params) => {
			params = params ?? null!;
			console.log('[http] invoke', name, params);
			const service = findService(name);
			if (!service) {
				return {ok: false, status: 400, message: 'failed to invoke unknown service'};
			}
			const path = params ? inject(service.route.path, params) : service.route.path;
			const {method} = service.route;
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
						message: 'failed to parse server response',
					};
				}
				console.log('[http api client] result', res.ok, res.status, json);
				if (res.ok) {
					return {ok: true, status: res.status, value: json};
				} else {
					return {
						ok: false,
						status: res.status,
						message: json.message || res.statusText || 'unknown error',
					};
				}
			} catch (err) {
				console.error('[http api client] fetch error', err);
				return {
					ok: false,
					status: null,
					message: 'unknown error',
				};
			}
		},
		close: () => {
			// TODO ?
		},
	};
	return client;
};
