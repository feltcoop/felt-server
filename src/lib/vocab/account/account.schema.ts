export const AccountSchema = {
	$id: '/schemas/Account.json',
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
export interface CreateAccountParams {
	name: string;
	password: string;
}

export const AccountModelSchema = {
	$id: '/schemas/AccountModel.json',
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
