import {toValidateSchema} from '$lib/util/ajv';
import type {Account} from '$lib/vocab/account/account';
import {AccountSchema} from '$lib/vocab/account/account';

export const validateAccount = toValidateSchema<Account>(AccountSchema);
