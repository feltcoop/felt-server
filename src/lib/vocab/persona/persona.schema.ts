export const AccountPersonaSchema = {
	$id: '/schemas/AccountPersona.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'number'},
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['account']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['persona_id', 'account_id', 'community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};
export const CommunityPersonaSchema = {
	$id: '/schemas/CommunityPersona.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'null'},
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['community']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['persona_id', 'community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};
//TODO BIG HACK HERE; should use references in anyOf
export const PersonaSchema = {
	$id: '/schemas/Persona.json',
	anyOf: [AccountPersonaSchema, CommunityPersonaSchema],
	tsType: 'AccountPersona | CommunityPersona',
};
