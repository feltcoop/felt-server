import Ajv, {_} from 'ajv';
import type {ErrorObject, ValidateFunction, AnySchema} from 'ajv';

let ajvInstance: Ajv | null = null;

// TODO maybe accept options, and store `ajv` references by each?
export const ajv = () => ajvInstance || (ajvInstance = new Ajv());
// .addKeyword('kind')

export interface CreateValidate<T = unknown> {
	(): ValidateFunction<T>;
}

const validators: Map<AnySchema, ValidateFunction> = new Map();

// TODO improve this and `toValidateSchema` so they use the same cache
// Memoizes the returned schema validation function in the module-level lookup `validators`.
export const validateSchema = <T>(schema: AnySchema): ValidateFunction<T> => {
	let validate = validators.get(schema) as ValidateFunction<T>;
	if (!validate) {
		validators.set(schema, (validate = toValidateSchema<T>(schema)()));
	}
	return validate;
};

// TODO try to fix this type, should use `Static`
// Creates a lazily-compiled schema validation function to avoid wasteful compilation.
// It's also faster than ajv's internal compiled schema cache
// because we can assume a consistent environment.
export const toValidateSchema = <T>(schema: AnySchema): CreateValidate<T> => {
	let validate: ValidateFunction<T>;
	return () => validate || (validate = ajv().compile(schema));
};

// TODO probably misses a bunch of cases
export const toValidationErrorMessage = (e: ErrorObject): string =>
	e.keyword === 'additionalProperties'
		? `${e.message}: '${e.params.additionalProperty}'`
		: e.instancePath
		? `'${e.instancePath.substring(1)}' ${e.message}`
		: e.message!;
