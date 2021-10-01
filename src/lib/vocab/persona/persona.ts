import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface Persona extends Static<typeof PersonaSchema> {}
export const PersonaSchema = Type.Object(
	{
		persona_id: Type.Number(),
		account_id: Type.Number(),
		name: Type.String(),
		icon: Type.Optional(Type.String()),
		community_ids: Type.Array(Type.Number()),
	},
	{$id: 'https://felt.social/vocab/Persona.json', additionalProperties: false},
);

export interface PersonaParams extends Static<typeof PersonaParamsSchema> {}
export const PersonaParamsSchema = Type.Object(
	{
		name: Type.String(),
	},
	{$id: 'https://felt.social/vocab/PersonaParams.json', additionalProperties: false},
);

//TODO
//2.5: Render active persona
