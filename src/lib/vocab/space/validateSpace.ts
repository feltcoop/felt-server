import {toValidateSchema} from '$lib/util/ajv';
import {SpaceSchema} from './space';
import type {Space} from './space';

export const validateSpace = toValidateSchema<Space>(SpaceSchema);
