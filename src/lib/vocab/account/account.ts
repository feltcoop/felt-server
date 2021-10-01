export interface Account {
	account_id: number;
	name: string;
	password: string;
}
export const AccountSchema = {
	$id: 'https://felt.social/vocab/Account.json',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
	},
	required: ['account_id', 'name', 'password'],
	additionalProperties: false,
};

export interface AccountParams {
	name: string;
	password: string;
}
export const AccountParamsSchema = {
	$id: 'https://felt.social/vocab/AccountParams.json',
	properties: {
		name: {type: 'string'},
		password: {type: 'string'},
	},
	required: ['name', 'password'],
	additionalProperties: false,
};

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const accountProperties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const accountModelProperties: (keyof AccountModel)[] = ['account_id', 'name'];
