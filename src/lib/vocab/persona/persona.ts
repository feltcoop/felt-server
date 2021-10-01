export interface Persona {
	persona_id: number;
	account_id: number;
	name: string;
	icon?: string;
	community_ids: number[];
}
export const PersonaSchema = {
	$id: 'https://felt.social/vocab/Persona.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'number'},
		name: {type: 'string'},
		icon: {type: 'string'},
		community_ids: {type: 'array', items: {type: 'number'}},
	},
	required: ['persona_id', 'account_id', 'name', 'community_ids'],
	additionalProperties: false,
};

export interface PersonaParams {
	name: string;
}
export const PersonaParamsSchema = {
	$id: 'https://felt.social/vocab/PersonaParams.json',
	type: 'object',
	properties: {
		name: {type: 'string'},
	},
	required: ['name'],
	additionalProperties: false,
};

//TODO
//2.5: Render active persona
