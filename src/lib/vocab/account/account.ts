export interface Account {
	account_id: number;
	name: string;
	password: string;
	created: Date;
	updated: Date | null;
}
export const AccountSchema = {
	$id: 'https://felt.dev/vocab/Account.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['account_id', 'name', 'password', 'created', 'updated'],
	additionalProperties: false,
};

// TODO make the `create_account` event in account.events.ts
export interface CreateAccountParamsType {
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
	$id: 'https://felt.dev/vocab/AccountModel.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['account_id', 'name', 'created', 'updated'],
	additionalProperties: false,
};
