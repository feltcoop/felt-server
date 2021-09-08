import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service, ServiceParamsSchema, ServiceResponseData} from '$lib/server/service';
import {ajv, toValidationErrorMessage} from '$lib/util/ajv';

// Wraps a `Service` in an http `Middleware`
export const toServiceMiddleware =
	(server: ApiServer, service: Service<ServiceParamsSchema, ServiceResponseData>): Middleware =>
	async (req, res) => {
		// TODO validate input/output via properties on each `Service`
		try {
			// TODO hack -- remove when `id`s are changed to strings
			// (and maybe support numbers in params with a better pattern?)
			for (const paramName in req.params) {
				if (paramName.endsWith('_id')) {
					req.params[paramName] = Number(req.params[paramName]) as any;
				}
			}

			const params = {...req.body, ...req.params};
			const validateParams =
				service.validateParams || (service.validateParams = ajv.compile(service.paramsSchema));
			const valid = validateParams(params);
			if (!valid) {
				// TODO handle multiple errors instead of just the first
				console.error('validation failed:', params, validateParams.errors);
				const validationError = validateParams.errors![0];
				return send(res, 400, {reason: toValidationErrorMessage(validationError)});
			}
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
			console.error(err);
			send(res, 500, {reason: 'unknown server error'});
		}
	};
