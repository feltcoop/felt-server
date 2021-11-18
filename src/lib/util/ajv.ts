import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type {ErrorObject, ValidateFunction, SchemaObject} from 'ajv';

import {schemas} from '$lib/app/schemas';

let ajvInstance: Ajv | null = null;

// TODO maybe accept options, and store `ajv` references by each?
export const ajv = (): Ajv => {
	if (ajvInstance) return ajvInstance;
	ajvInstance = new Ajv();
	ajvInstance.addKeyword('tsType');
	addFormats(ajvInstance);
	for (const schema of schemas) {
		ajvInstance.addSchema(schema);
	}
	return ajvInstance;
};

export interface CreateValidate<T = unknown> {
	(): ValidateFunction<T>;
}

const validators: Map<SchemaObject, ValidateFunction> = new Map();

// Memoizes the returned schema validation function in the module-level lookup `validators`.
// Does not support multiple instantiations with different options.
export const validateSchema = <T>(schema: SchemaObject): ValidateFunction<T> =>
	toValidateSchema<T>(schema)();

// Creates a lazily-compiled schema validation function to avoid wasteful compilation.
// It's also faster than ajv's internal compiled schema cache
// because we can assume a consistent environment.
export const toValidateSchema = <T>(schema: SchemaObject): CreateValidate<T> => {
	let validate = validators.get(schema) as ValidateFunction<T> | undefined;
	return () => {
		if (validate) return validate;
		validate = ajv().compile(schema);
		validators.set(schema, validate);
		return validate;
	};
};

// TODO probably misses a bunch of cases
export const toValidationErrorMessage = (e: ErrorObject): string =>
	e.keyword === 'additionalProperties'
		? `${e.message}: '${e.params.additionalProperty}'`
		: e.instancePath
		? `'${e.instancePath.substring(1)}' ${e.message}`
		: e.message!;
