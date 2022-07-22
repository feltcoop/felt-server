import send from '@polka/send-type';
import {red, blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ApiServer, HttpMiddleware} from '$lib/server/ApiServer.js';
import {type Service, toServiceRequest} from '$lib/server/service';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {SessionApi} from '$lib/session/SessionApi';
import {authorize} from '$lib/server/authorize';

const log = new Logger(gray('[') + blue('httpServiceMiddleware') + gray(']'));

// Wraps a `Service` in an http `Middleware`
export const toHttpServiceMiddleware =
	(server: ApiServer, service: Service<any, any>): HttpMiddleware =>
	async (req, res) => {
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
			for (const paramName in reqParams) {
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

		const authorizeResult = authorize(req.account_id, service);
		if (!authorizeResult.ok) {
			return send(res, 403, {message: authorizeResult.message});
		}

		const params = service.event.params.type === 'null' ? null : {...reqBody, ...reqParams};

		const validateParams = validateSchema(service.event.params);
		if (!validateParams(params)) {
			// TODO handle multiple errors instead of just the first
			log.error('validation failed:', params, validateParams.errors);
			const validationError = validateParams.errors![0];
			return send(res, 400, {message: toValidationErrorMessage(validationError)});
		}

		let result;
		try {
			result = await service.perform(
				toServiceRequest(server.db, params, req.account_id!, new SessionApi(req, res)),
			);
		} catch (err) {
			log.error(err);
			send(res, 500, {message: 'unknown server error'});
		}

		if (!result.ok) {
			send(res, result.status || 500, {message: result.message});
			return;
		}
		if (process.env.NODE_ENV !== 'production') {
			const validateResponse = validateSchema(service.event.response);
			if (!validateResponse(result.value)) {
				log.error(
					red('failed to validate service response'),
					service.event.name,
					result,
					validateResponse.errors,
				);
				throw Error('Service validation failed');
			}
		}
		log.trace('result.status', result.status);
		send(res, result.status, result.value); // TODO consider returning the entire `result` for convenience (but it's less efficient)
	};
