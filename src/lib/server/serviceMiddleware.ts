import send from '@polka/send-type';
import type {TSchema} from '@sinclair/typebox';
import {red} from '@feltcoop/felt/util/terminal.js';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service} from '$lib/server/service';
import {toValidationErrorMessage} from '$lib/util/ajv';

// TODO refactor this with the `ApiServer` websocket handler,
// probably just a config object

// Wraps a `Service` in an http `Middleware`
export const toServiceMiddleware =
	(server: ApiServer, service: Service<TSchema, TSchema>): Middleware =>
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
			const validateParams = service.validateParams();
			if (!validateParams(params)) {
				// TODO handle multiple errors instead of just the first
				console.error('validation failed:', params, validateParams.errors);
				const validationError = validateParams.errors![0];
				return send(res, 400, {reason: toValidationErrorMessage(validationError)});
			}
			if (!req.account_id) {
				// TODO this is duplicating the role of the `authorizationMiddleware` to avoid mistakes,
				// but what's the better design here?
				// Should each service declare if `account_id` is required?
				return send(res, 401, {reason: 'not logged in'});
			}
			const response = await service.perform(server, params, req.account_id);
			if (process.env.NODE_ENV !== 'production') {
				if (!service.validateResponse()(response.data)) {
					console.error(red('validation failed:'), response, service.validateResponse().errors);
				}
			}
			console.log('[serviceMiddleware] result.code', response.code);
			send(res, response.code, response.data);
		} catch (err) {
			console.error(err);
			send(res, 500, {reason: 'unknown server error'});
		}
	};
