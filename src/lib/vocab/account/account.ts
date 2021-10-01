import {toValidateSchema} from '$lib/util/ajv';

export interface Account {
	account_id: number;
	name: string;
	password: string;
}
export const AccountSchema = {
	$id: 'Account',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
	},
	required: ['account_id', 'name', 'password'],
	additionalProperties: false,
};
export const validateAccount = toValidateSchema<Account>(AccountSchema);

export interface AccountParams {
	name: string;
	password: string;
}
export const AccountParamsSchema = {
	$id: 'Account',
	properties: {
		name: {type: 'string'},
		password: {type: 'string'},
	},
	required: ['name', 'password'],
	additionalProperties: false,
};
export const validateAccountParams = toValidateSchema<AccountParams>(AccountParamsSchema);

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const accountProperties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const accountModelProperties: (keyof AccountModel)[] = ['account_id', 'name'];
