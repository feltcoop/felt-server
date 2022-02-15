export const PersonaSchema = {
	$id: '/schemas/Persona.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'number'},
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['account', 'community']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['persona_id', 'community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

export const PersonaParamsSchema = {
	$id: '/schemas/PersonaParams.json',
	type: 'object',
	properties: {
		name: {type: 'string'},
	},
	required: ['name'],
	additionalProperties: false,
};

//TODO
//2.5: Render active persona
