import send from '@polka/send-type';
import {red} from '@feltcoop/felt/util/terminal.js';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service} from '$lib/server/service';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';

// Wraps a `Service` in an http `Middleware`
export const toServiceMiddleware =
	(server: ApiServer, service: Service<any, any>): Middleware =>
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
								message: `route param '${paramName}' mismatches the request body value`,
							});
						}
					}
				}
			}

			if (!service.event.params || !service.event.response) {
				return send(res, 500, {message: 'unimplemented service schema'});
			}

			const params = {...reqBody, ...reqParams};

			const validateParams = validateSchema(service.event.params);
			if (!validateParams(params)) {
				// TODO handle multiple errors instead of just the first
				console.error('validation failed:', params, validateParams.errors);
				const validationError = validateParams.errors![0];
				return send(res, 400, {message: toValidationErrorMessage(validationError)});
			}
			if (!req.account_id) {
				// TODO this is duplicating the role of the `authorizationMiddleware` to avoid mistakes,
				// but what's the better design here?
				// Should each service declare if `account_id` is required?
				return send(res, 401, {message: 'not logged in'});
			}

			const result = await service.perform({
				repos: server.db.repos,
				params,
				account_id: req.account_id,
			});

			if (!result.ok) {
				send(res, result.status || 500, {message: result.message});
				return;
			}
			if (process.env.NODE_ENV !== 'production') {
				const validateResponse = validateSchema(service.event.response);
				if (!validateResponse(result.value)) {
					console.error(red('validation failed:'), result, validateResponse.errors);
				}
			}
			console.log('[serviceMiddleware] result.status', result.status);
			send(res, result.status, result.value); // TODO consider returning the entire `result` for convenience (but it's less efficient)
		} catch (err) {
			console.error(err);
			send(res, 500, {message: 'unknown server error'});
		}
	};
