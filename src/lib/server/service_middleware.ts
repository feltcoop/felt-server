import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service, ServiceParams, ServiceResponseData} from '$lib/server/service';

// Wraps a `Service` in an http `Middleware`
export const toServiceMiddleware =
	(server: ApiServer, service: Service<ServiceParams, ServiceResponseData>): Middleware =>
	async (req, res) => {
		// TODO validate input/output via properties on each `Service`
		try {
			const params: ServiceParams = {...req.body, ...req.params, account_id: req.account_id};
			if (!req.account_id) {
				// TODO this is duplicating the role of the `authorization_middleware` to avoid mistakes,
				// but what's the better design here?
				// Should each service declare if `account_id` is required?
				return send(res, 401, {reason: 'not logged in'});
			}
			const result = await service.handle(server, params, req.account_id);
			console.log('[service_middleware] result.code', result.code);
			send(res, result.code, result.data);
		} catch (err) {
			send(res, 500, {reason: 'unknown server error'});
		}
	};
