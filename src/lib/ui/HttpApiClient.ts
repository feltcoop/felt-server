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
		invoke: async <TMethod extends string, TParams extends TParamsMap[TMethod]>(
			method: TMethod,
			params: TParams,
		): Promise<TResultMap[TMethod]> => {
			console.log('[http api client] method, params', method, params);
			const serviceMeta: ServiceMeta = (servicesMeta as any)[method]; // TODO lighten this dependency, don't need the schemas
			if (!serviceMeta) throw Error(`Unable to find serviceMeta: ${method}`);
			const path = inject(serviceMeta.route.path, params); // TODO cache this
			const res = await fetch(path, {
				method: serviceMeta.route.method.toUpperCase(), // TODO is
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(params),
			});
			console.log('res', res);
			const json = await res.json();
			console.log('json', json);
			return json;
		},
		close: () => {
			//
		},
	};
};
