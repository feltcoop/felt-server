import {toValidateSchema} from '$lib/util/ajv';
import {CommunitySchema} from '$lib/vocab/community/community';
import type {Community} from '$lib/vocab/community/community';

export const validateCommunity = toValidateSchema<Community>(CommunitySchema);
