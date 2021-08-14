export interface Account {
	account_id: number;
	name: string;
	password: string;
}

export interface Account_Params {
	name: string;
	password: string;
}

// TODO rename? `Account_Client_Doc`? above could be `Account_Db_Doc` and `Account_Request_Doc`
export interface Account_Model {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const account_properties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const account_model_properties: (keyof Account_Model)[] = ['account_id', 'name'];
