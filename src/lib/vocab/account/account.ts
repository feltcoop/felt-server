import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';
import {toValidateSchema} from '$lib/util/ajv';

export interface Account extends Static<typeof AccountSchema> {}
export const AccountSchema = Type.Object(
	{
		account_id: Type.Number(),
		name: Type.String(),
		password: Type.String(),
		created: Type.String(),
		updated: Type.Optional(Type.String()),
	},
	{$id: 'Account', additionalProperties: false},
);
export const validateAccount = toValidateSchema<Account>(AccountSchema);

export interface AccountParams extends Static<typeof AccountParamsSchema> {}
export const AccountParamsSchema = Type.Object(
	{
		name: Type.String(),
		password: Type.String(),
	},
	{$id: 'AccountParams', additionalProperties: false},
);
export const validateAccountParams = toValidateSchema<AccountParams>(AccountParamsSchema);

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel extends Static<typeof AccountModelSchema> {}
export const AccountModelSchema = Type.Object(
	{
		account_id: Type.Number(),
		name: Type.String(),
		created: Type.String(),
		updated: Type.Optional(Type.String()),
	},
	{$id: 'AccountModel', additionalProperties: false},
);
export const validateAccountModel = toValidateSchema<AccountModel>(AccountModelSchema);

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const accountProperties: (keyof Account)[] = [
	'account_id',
	'name',
	'password',
	'created',
	'updated',
];
export const accountModelProperties: (keyof AccountModel)[] = [
	'account_id',
	'name',
	'created',
	'updated',
];
