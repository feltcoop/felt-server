export interface Persona {
	persona_id?: number;
	account_id: number;
	name: string;
}

export interface Persona_Params {
	account_id: number;
	name: string;
}

//TODO
//2: Add active persona to cookie info
//2.5: Render active persona
//3: Replace account w/ Persona in Community/Spaces/Members/Posts
