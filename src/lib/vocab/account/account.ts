import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export type Account = Static<typeof AccountSchema>;
export const AccountSchema = Type.Object(
	{
		account_id: Type.Number(),
		name: Type.String(),
		password: Type.String(),
	},
	{$id: 'Account', additionalProperties: false},
);

export type AccountParams = Static<typeof AccountParamsSchema>;
export const AccountParamsSchema = Type.Object(
	{
		name: Type.String(),
		password: Type.String(),
	},
	{$id: 'AccountParams', additionalProperties: false},
);

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const accountProperties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const accountModelProperties: (keyof AccountModel)[] = ['account_id', 'name'];
