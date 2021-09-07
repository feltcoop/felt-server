import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service, ServiceParams} from '$lib/server/service';

// Wraps a `Service` in an http `Middleware`
export const toServiceMiddleware = (server: ApiServer, service: Service): Middleware => {
	return async (req, res) => {
		// TODO validate input/output via properties on each `Service`
		try {
			const params: ServiceParams = {...req.body, ...req.params};
			if (!req.account_id) throw Error('TODO unauthorized -- fix type or perform check');
			const result = await service.handle(server, params, req.account_id);
			console.log('[service_middleware] result.code', result.code);
			send(res, result.code, result.data);
		} catch (err) {
			send(res, 500, {reason: 'unknown server error'});
		}
	};
};
