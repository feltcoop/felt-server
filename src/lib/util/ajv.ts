import Ajv, {type Options, type ErrorObject, type ValidateFunction, type SchemaObject} from 'ajv';
import type {VocabSchema} from '@feltcoop/gro/dist/utils/schema.js';
import AjvKeywordInstanceof from 'ajv-keywords/dist/keywords/instanceof.js';

import {schemas} from '$lib/app/schemas';

let ajvInstance: Ajv | null = null;

// TODO only one instance is created, which may be surprising in rare cases
export const ajv = (opts?: Options): Ajv => {
	if (ajvInstance) return ajvInstance;
	ajvInstance = new Ajv(opts);
	ajvInstance.addKeyword('tsType').addKeyword('tsImport');
	AjvKeywordInstanceof(ajvInstance);
	for (const schema of schemas) {
		// This cast is needed because TypeScript's `exactOptionalPropertyTypes` is enabled
		// and `json-schema` types have `| undefined` but `ajv` does not.
		ajvInstance.addSchema(schema as SchemaObject);
	}
	return ajvInstance;
};

export interface CreateValidate<T = unknown> {
	(): ValidateFunction<T>;
}

const validators: Map<SchemaObject | VocabSchema, ValidateFunction> = new Map();

// Memoizes the returned schema validation function in the module-level lookup `validators`.
// Does not support multiple instantiations with different options.
export const validateSchema = <T>(schema: SchemaObject | VocabSchema): ValidateFunction<T> =>
	toValidateSchema<T>(schema)();

// Creates a lazily-compiled schema validation function to avoid wasteful compilation.
// It's also faster than ajv's internal compiled schema cache
// because we can assume a consistent environment.
export const toValidateSchema = <T>(schema: SchemaObject | VocabSchema): CreateValidate<T> => {
	let validate = validators.get(schema) as ValidateFunction<T> | undefined;
	return () => {
		if (validate) return validate;
		validate = ajv().compile(schema as SchemaObject);
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
