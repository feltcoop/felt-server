export interface Persona {
	persona_id: number;
	account_id: number;
	name: string;
	community_ids: number[];
}

export interface PersonaParams {
	account_id: number;
	name: string;
}

//TODO
//2.5: Render active persona
