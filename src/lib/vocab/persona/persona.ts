import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

import {toValidateSchema} from '$lib/util/ajv';

export interface Persona extends Static<typeof PersonaSchema> {}
export const PersonaSchema = Type.Object(
	{
		persona_id: Type.Number(),
		account_id: Type.Number(),
		name: Type.String(),
		community_ids: Type.Array(Type.Number()),
	},
	{$id: 'Persona', additionalProperties: false},
);
export const validatePersona = toValidateSchema<Persona>(PersonaSchema);

export interface PersonaParams extends Static<typeof PersonaParamsSchema> {}
export const PersonaParamsSchema = Type.Object(
	{
		account_id: Type.Number(),
		name: Type.String(),
	},
	{$id: 'PersonaParams', additionalProperties: false},
);
export const validatePersonaParams = toValidateSchema<PersonaParams>(PersonaParamsSchema);

//TODO
//2.5: Render active persona
