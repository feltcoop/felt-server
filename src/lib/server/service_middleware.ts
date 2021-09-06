import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service} from '$lib/server/service';

// Wraps a `Service` in an http `Middleware`
export const to_service_middleware = (server: ApiServer, service: Service): Middleware => {
	return async (req, res) => {
		// TODO validate input/output via properties on each `Service`
		try {
			const result = await service.handle(server, req);
			console.log('[service_middleware] result.code', result.code);
			send(res, result.code, result.data);
		} catch (err) {
			send(res, 500, {reason: 'unknown server error'});
		}
	};
};
