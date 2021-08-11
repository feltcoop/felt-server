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

// TODO improve type so it's exhaustive (maybe via schema/codegen)
export const account_model_client_fields: (keyof Account_Model)[] = ['account_id', 'name'];
