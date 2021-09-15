// this is *not* RESTful as in HATEOS,
// it's a convenient alternative to the primary websocket API

import type {ApiClient} from '$lib/ui/ApiClient';
import * as servicesMeta from '$lib/server/servicesMeta';
import type {ServiceMeta} from '$lib/server/servicesMeta';

export const toApiClient = <
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
			const path = method;
			const res = await fetch(path, {
				method: serviceMeta.route.method.toUpperCase(), // TODO is
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(params),
			});
			const json = await res.json();
			return json;
		},
		close: () => {
			//
		},
	};
};
