import {toValidateSchema} from '$lib/util/ajv';
import {FileParamsSchema, FileSchema} from '$lib/vocab/file/file';
import type {File, FileParams} from '$lib/vocab/file/file';

export const validateFile = toValidateSchema<File>(FileSchema);

export const validateFileParams = toValidateSchema<FileParams>(FileParamsSchema);
