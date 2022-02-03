import {toValidateSchema} from '$lib/util/ajv';
import {
	AccountSchema,
	type Account,
	type AccountModel,
	AccountModelSchema,
} from '$lib/vocab/account/account';

export const validateAccount = toValidateSchema<Account>(AccountSchema);
export const validateAccountModel = toValidateSchema<AccountModel>(AccountModelSchema);
