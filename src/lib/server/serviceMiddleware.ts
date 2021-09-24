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
			const {body: reqBody, params: reqParams} = req;

			// TODO hack -- remove when `id`s are changed to strings
			// (and maybe support numbers in params with a better pattern?)
			for (const paramName in req.params) {
				if (paramName.endsWith('_id')) {
					req.params[paramName] = Number(req.params[paramName]) as any;
				}
			}

			// Check each of `req.params` and ensure that they're
			// either absent from `req.body` or their values match exactly.
			// This is a nececssary check to ensure users don't get surprising results.
			// Our HTTP API supports duplicating the route params in the body
			// for convenience and consistency with the websocket API.
			if (reqBody) {
				for (var paramName in reqParams) {
					if (paramName in reqBody) {
						if (reqParams[paramName] !== reqBody[paramName]) {
							return send(res, 400, {
								reason: `Route param '${paramName}' mismatches the value in the request body`,
							});
						}
					}
				}
			}

			const params = {...reqBody, ...reqParams};
			if (!service.validateParams()(params)) {
				// TODO handle multiple errors instead of just the first
				console.error('validation failed:', params, service.validateParams().errors);
				const validationError = service.validateParams().errors![0];
				return send(res, 400, {reason: toValidationErrorMessage(validationError)});
			}
			if (!req.account_id) {
				// TODO this is duplicating the role of the `authorizationMiddleware` to avoid mistakes,
				// but what's the better design here?
				// Should each service declare if `account_id` is required?
				return send(res, 401, {reason: 'not logged in'});
			}
			const response = await service.perform({server, params, account_id: req.account_id});
			if (process.env.NODE_ENV !== 'production') {
				if (!service.validateResponse()(response.value)) {
					console.error(red('validation failed:'), response, service.validateResponse().errors);
				}
			}
			console.log('[serviceMiddleware] result.code', response.status);
			send(res, response.status, response.value);
		} catch (err) {
			console.error(err);
			send(res, 500, {reason: 'unknown server error'});
		}
	};
