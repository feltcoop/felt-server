import {toValidateSchema} from '$lib/util/ajv';
import {CommunityParamsSchema, CommunitySchema} from '$lib/vocab/community/community';
import type {Community, CommunityParams} from '$lib/vocab/community/community';

export const validateCommunity = toValidateSchema<Community>(CommunitySchema);

export const validateCommunityParams = toValidateSchema<CommunityParams>(CommunityParamsSchema);
