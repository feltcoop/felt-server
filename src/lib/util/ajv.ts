import Ajv from 'ajv';
import type {ErrorObject, ValidateFunction} from 'ajv';
import type {TSchema} from '@sinclair/typebox';

export const ajv = new Ajv()
	// These are needed so the schemas created by `@sinclair/typebox` don't error --
	// adding them like this easier than using `Strict`.
	.addKeyword('kind')
	.addKeyword('modifier');

// Creates a lazily-compiled schema validation function to avoid wasteful compilation.
// It's also faster than ajv's internal compiled schema cache
// because we can assume a consistent environment.
export const toValidateSchema = <T>(schema: TSchema): (() => ValidateFunction<T>) => {
	let validate: ValidateFunction<T>;
	return () => validate || (validate = ajv.compile(schema));
};

// TODO probably misses a bunch of cases
export const toValidationErrorMessage = (e: ErrorObject): string =>
	e.keyword === 'additionalProperties'
		? `${e.message}: '${e.params.additionalProperty}'`
		: e.instancePath
		? `'${e.instancePath.substring(1)}' ${e.message}`
		: e.message!;
