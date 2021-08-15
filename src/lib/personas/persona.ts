export interface Persona {
	persona_id?: number;
	account_id: number;
	name: string;
	communities: number[];
}

export interface Persona_Params {
	account_id: number;
	name: string;
}

//TODO
//2.5: Render active persona
