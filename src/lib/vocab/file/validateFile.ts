import {toValidateSchema} from '$lib/util/ajv';
import {FileSchema} from '$lib/vocab/file/file';
import type {File} from '$lib/vocab/file/file';

export const validateFile = toValidateSchema<File>(FileSchema);
