export const AccountSchema = {
	$id: '/schemas/Account.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'password', 'created', 'updated'],
	additionalProperties: false,
};

// TODO make the `create_account` event in accountEvents.ts
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
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'created', 'updated'],
	additionalProperties: false,
};
