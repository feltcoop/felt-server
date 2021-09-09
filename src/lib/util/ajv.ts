import Ajv from 'ajv';
import type {ErrorObject} from 'ajv';

export const ajv = new Ajv()
	// These are needed so the schemas created by `@sinclair/typebox` don't error --
	// adding them like this easier than using `Strict`.
	.addKeyword('kind')
	.addKeyword('modifier');

// TODO probably misses a bunch of cases
export const toValidationErrorMessage = (e: ErrorObject): string =>
	e.keyword === 'additionalProperties'
		? `${e.message}: '${e.params.additionalProperty}'`
		: e.instancePath
		? `'${e.instancePath.substring(1)}' ${e.message}`
		: e.message!;
