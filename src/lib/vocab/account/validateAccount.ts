import {toValidateSchema} from '$lib/util/ajv';
import type {Account, AccountParams} from '$lib/vocab/account/account';
import {AccountParamsSchema, AccountSchema} from '$lib/vocab/account/account';

export const validateAccount = toValidateSchema<Account>(AccountSchema);

export const validateAccountParams = toValidateSchema<AccountParams>(AccountParamsSchema);
