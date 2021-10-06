export interface Account {
	account_id: number;
	name: string;
	password: string;
	created: Date;
	updated: Date | null;
}
export const AccountSchema = {
	$id: 'https://felt.social/vocab/Account.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
		created: {type: 'object', format: 'date-time'},
		updated: {type: ['object', 'null'], format: 'date-time'},
	},
	required: ['account_id', 'name', 'password', 'created', 'updated'],
	additionalProperties: false,
};

// TODO make the `create_account` event in account.events.ts
export interface create_account_params_type {
	name: string;
	password: string;
}

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
	created: Date;
	updated: Date | null;
}

export const AccountModelSchema = {
	$id: 'https://felt.social/vocab/AccountModel.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		created: {type: 'object', format: 'date-time'},
		updated: {type: ['object', 'null'], format: 'date-time'},
	},
	required: ['account_id', 'name', 'created', 'updated'],
	additionalProperties: false,
};

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
