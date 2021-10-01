import {toValidateSchema} from '$lib/util/ajv';
import {SpaceParamsSchema, SpaceSchema} from './space';
import type {Space, SpaceParams} from './space';

export const validateSpace = toValidateSchema<Space>(SpaceSchema);

export const validateSpaceParams = toValidateSchema<SpaceParams>(SpaceParamsSchema);
