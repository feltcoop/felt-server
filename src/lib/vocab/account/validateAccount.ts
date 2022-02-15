import {toValidateSchema} from '$lib/util/ajv';
import {type Account, type AccountModel} from '$lib/vocab/account/account';
import {AccountSchema, AccountModelSchema} from '$lib/vocab/account/account.schema';

export const validateAccount = toValidateSchema<Account>(AccountSchema);
export const validateAccountModel = toValidateSchema<AccountModel>(AccountModelSchema);
