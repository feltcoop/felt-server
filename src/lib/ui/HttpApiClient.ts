// This is *not* RESTful as in HATEOS;
// it's a convenient alternative to the primary websocket API,
// and because of its secondary importance it's expected
// to have significant limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';

import type {ApiClient} from '$lib/ui/ApiClient';
import * as servicesMeta from '$lib/server/servicesMeta';
import type {ServiceMeta} from '$lib/server/servicesMeta';

export const toHttpApiClient = <
	TParamsMap extends Record<string, object>,
	TResultMap extends Record<string, object>,
>(): ApiClient<TParamsMap, TResultMap> => {
	return {
		invoke: async <TServiceName extends string, TParams extends TParamsMap[TServiceName]>(
			name: TServiceName,
			params: TParams,
		): Promise<TResultMap[TServiceName]> => {
			console.log('[http api client] invoke', name, params);
			const serviceMeta: ServiceMeta = (servicesMeta as any)[name]; // TODO lighten this dependency, don't need the schemas
			if (!serviceMeta) throw Error(`Unable to find serviceMeta: ${name}`); // TODO return result instead of throwing
			const path = inject(serviceMeta.route.path, params);
			const {method} = serviceMeta.route;
			try {
				const res = await fetch(path, {
					method,
					headers: {'content-type': 'application/json'},
					body: method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params),
				});
				const result = await res.json();
				console.log('[http api client] result', result);
				return result;
			} catch (err) {
				// TODO handle errors
				return null as any;
			}
		},
		close: () => {
			//
		},
	};
};
