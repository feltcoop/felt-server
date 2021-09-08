import Ajv from 'ajv';
import type {ErrorObject} from 'ajv';

export const ajv = new Ajv().addKeyword('kind').addKeyword('modifier');

// TODO hacky, might not be correct in all cases (probably isn't!)
export const toErrorMessage = (validationError: ErrorObject): string =>
	validationError.instancePath
		? `'${validationError.instancePath.substring(1)}' ${validationError.message}`
		: validationError.message!;
