import {toValidateSchema} from '$lib/util/ajv';
import {Account, AccountModel, AccountModelSchema} from '$lib/vocab/account/account';
import {AccountSchema} from '$lib/vocab/account/account';

export const validateAccount = toValidateSchema<Account>(AccountSchema);
export const validateAccountModel = toValidateSchema<AccountModel>(AccountModelSchema);
