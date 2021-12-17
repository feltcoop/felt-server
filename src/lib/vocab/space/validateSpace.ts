import {toValidateSchema} from '$lib/util/ajv';
import {SpaceSchema} from '$lib/vocab/space/space';
import type {Space} from '$lib/vocab/space/space';

export const validateSpace = toValidateSchema<Space>(SpaceSchema);
