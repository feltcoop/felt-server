export interface Account {
	account_id: number;
	name: string;
	password: string;
}

export interface AccountParams {
	name: string;
	password: string;
}

// TODO rename? `AccountClientDoc`? above could be `AccountDbDoc` and `AccountRequestDoc`
export interface AccountModel {
	account_id: number;
	name: string;
}

// TODO improve types so they're exhaustive but still static (maybe via schema/codegen)
export const account_properties: (keyof Account)[] = ['account_id', 'name', 'password'];
export const account_model_properties: (keyof AccountModel)[] = ['account_id', 'name'];
