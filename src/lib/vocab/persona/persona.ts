import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export type Persona = Static<typeof PersonaSchema>;
export const PersonaSchema = Type.Object(
	{
		persona_id: Type.Number(),
		account_id: Type.Number(),
		name: Type.String(),
		community_ids: Type.Array(Type.Number()),
	},
	{$id: 'Persona', additionalProperties: false},
);

export type PersonaParams = Static<typeof PersonaParamsSchema>;
export const PersonaParamsSchema = Type.Object(
	{
		account_id: Type.Number(),
		name: Type.String(),
	},
	{$id: 'PersonaParams', additionalProperties: false},
);

//TODO
//2.5: Render active persona
