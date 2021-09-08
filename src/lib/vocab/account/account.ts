import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface Account {
	account_id: number;
	name: string;
	password: string;
}

export type AccountParams = Static<typeof AccountParamsSchema>;
export const AccountParamsSchema = Type.Object(
	{
		name: Type.String(),
		password: Type.String(),
	},
	{additionalProperties: false},
);

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const account_properties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const account_model_properties: (keyof AccountModel)[] = ['account_id', 'name'];
