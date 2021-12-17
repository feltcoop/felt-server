import {toValidateSchema} from '$lib/util/ajv';
import {FileSchema} from '$lib/vocab/entity/entity';
import type {File} from '$lib/vocab/entity/entity';

export const validateFile = toValidateSchema<File>(FileSchema);
